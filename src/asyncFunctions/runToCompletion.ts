import assert = require('assert');
import types = require('types');
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
function runToCompletion(safa: types.SlowAsyncFunction.Activation) {

    // Kick off the recursive worker function.
    safa._slow.awaiting.then(value => step(safa, null, value), error => step(safa, error));
}


/** Helper function to resume the underlying Steppable, then handle its return/throw/yield. */
function step(safa: types.SlowAsyncFunction.Activation, error?: any, next?: any) {

    // Resume the underlying Steppable, either throwing into it or calling next(), depending on args.
    try {
        var yielded = arguments.length === 1 ? safa.throw(error) : safa.next(next);
    }

    // The Steppable threw. Finalize and reject the SlowAsyncFunctionActivation.
    catch (ex) {
        storage.remove(safa);
        safa._slow.reject(ex);
        return;
    }

    // The Steppable returned. Finalize and resolve the SlowAsyncFunctionActivation.
    if (yielded.done) {
        storage.remove(safa);
        safa._slow.resolve(yielded.value);
        return;
    }

    // The Steppable yielded. Ensure the yielded value is awaitable, await it,
    // then call step() recursively with the eventual result or error.
    var awaiting: types.SlowPromise = safa._slow.awaiting = yielded.value;
    assert(awaiting && typeof awaiting.then === 'function', 'await: expected argument to be a Promise');
    storage.upsert(safa);
    awaiting.then(value => step(safa, null, value), error => step(safa, error));
}
