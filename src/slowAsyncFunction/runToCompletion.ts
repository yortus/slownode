import assert = require('assert');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import Promise = require('bluebird');
import Types = require('slownode');
import storage = require('../storage/storage');
export = runToCompletion;


//TODO: remove async/await from in here...


/**
 * Runs the given SlowAsyncFunctionActivation instance to completion. First, the `awaiting`
 * value is awaited, and then the SlowAsyncFunctionActivation is resumed with the eventual
 * value. Subsequent values yielded by the SlowAsyncFunctionActivation are awaited, and the
 * SlowAsyncFunctionActivation is resumed with their eventual values each time. This process
 * continues until the SlowAsyncFunctionActivation either returns or throws. If it throws,
 * this function rejects with the error. If it returns, this function resolves to its result.
 */
var runToCompletion = async(function (safa: Types.SlowAsyncFunctionActivation) {
    try {

        // Proceed in a loop until the SlowAsyncFunctionActivation either returns or throws.
        var value = null, error = null;
        while (true) {

            // Wait for the awaited value to be resolved or rejected.
            try {
                error = null, value = await(safa._slow.awaiting);
            }
            catch (ex) {
                error = ex;
            }

            // Resume the SlowAsyncFunctionActivation with the resolved/rejected value.
            // NB: If the SlowAsyncFunctionActivation throws, this function will throw here.
            var yielded = error ? safa.throw(error) : safa.next(value);

            // If the SlowAsyncFunctionActivation returned, then return its result.
            if (yielded.done) break;

            // The SlowAsyncFunctionActivation yielded. Ensure the yielded value is awaitable.
            // TODO: what should be allowed here? Implement checks...
            // TODO: what should be done if the value is NOT awaitable? How to handle failure? Just throw?
            assert(yielded.value && typeof yielded.value.then === 'function', 'await: expected argument to be a Promise');
            safa._slow.awaiting = yielded.value;

            // Before looping again, Persist the current state of the SlowAsyncFunctionActivation and that of the value to be awaited.
            // If the process is restarted before the awaited value is resolved/rejected, then the SlowAsyncFunctionActivation will
            // be able to continue from this persisted state.
            storage.update(safa._slow);
        }

        // Completed!
        safa._slow.resolve(yielded.value);
    }
    catch (ex) {

        // Error!
        safa._slow.reject(ex);
    }
    finally {

        // The SlowRoutine has terminated (ie either returned or threw). Remove its state from the database.
        storage.remove(safa._slow);
    }
});
