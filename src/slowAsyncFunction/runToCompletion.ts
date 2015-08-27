import assert = require('assert');
import Types = require('slownode');
import storage = require('../storage/storage');
export = runToCompletion;


/**
 * Runs the given SlowAsyncFunctionActivation instance to completion. First, the `awaiting`
 * value is awaited, and then the SlowAsyncFunctionActivation is resumed with the eventual
 * value. Subsequent values yielded by the SlowAsyncFunctionActivation are awaited, and the
 * SlowAsyncFunctionActivation is resumed with their eventual values each time. This process
 * continues until the SlowAsyncFunctionActivation either returns or throws. If it throws,
 * this function rejects with the error. If it returns, this function resolves to its result.
 */
function runToCompletion(safa: Types.SlowAsyncFunctionActivation) {

    // Kick off the recursive worker function.
    safa._slow.awaiting.then(value => step(safa, null, value), error => step(safa, error));
}


/** Helper function to resume the underlying SlowRoutine, then handle its return/throw/yield. */
function step(safa: Types.SlowAsyncFunctionActivation, error?: any, next?: any) {

    // Resume the underlying SlowRoutine, either throwing into it or calling next(), depending on args.
    try {
        var yielded = arguments.length === 1 ? safa.throw(error) : safa.next(next);
    }

    // The SlowRoutine threw. Finalize and reject the SlowAsyncFunctionActivation.
    catch (ex) {
        storage.remove(safa._slow);
        safa._slow.reject(ex);
        return;
    }

    // The SlowRoutine returned. Finalize and resolve the SlowAsyncFunctionActivation.
    if (yielded.done) {
        storage.remove(safa._slow);
        safa._slow.resolve(yielded.value);
        return;
    }

    // The SlowRoutine yielded. Ensure the yielded value is awaitable, await it,
    // then call step() recursively with the eventual result or error.
    var awaiting: Types.SlowPromise<any> = safa._slow.awaiting = yielded.value;
    assert(awaiting && typeof awaiting.then === 'function', 'await: expected argument to be a Promise');
    storage.upsert(safa._slow);
    awaiting.then(value => step(safa, null, value), error => step(safa, error));
}
