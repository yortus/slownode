var assert = require('assert');
var storage = require('../storage/storage');
/**
 * Runs the given SlowAsyncFunctionActivation instance to completion. First, the `awaiting`
 * value is awaited, and then the SlowAsyncFunctionActivation is resumed with the eventual
 * value. Subsequent values yielded by the SlowAsyncFunctionActivation are awaited, and the
 * SlowAsyncFunctionActivation is resumed with their eventual values each time. This process
 * continues until the SlowAsyncFunctionActivation either returns or throws. If it throws,
 * this function rejects with the error. If it returns, this function resolves to its result.
 */
function runToCompletion(safa) {
    // Kick off the recursive worker function.
    step(safa);
}
/** Helper function to resume the underlying Steppable, then handle its return/throw/yield. */
function step(safa, error, next) {
    // Resume the underlying Steppable, either throwing into it or calling next(), depending on args.
    try {
        var yielded;
        if (arguments.length === 0)
            yielded = safa.next(); // Resume as start (first call)
        else if (arguments.length === 1)
            yielded = safa.throw(error); // Resume with awaited's error
        else
            yielded = safa.next(next); // Resume with awaited's result
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
    // The Steppable yielded. Ensure the yielded value is awaitable.
    // TODO: review awaitability checks, supported values/types, and error handling
    var awaiting = safa._slow.awaiting = yielded.value;
    assert(awaiting && typeof awaiting.then === 'function', 'await: expected argument to be a Promise');
    // Persist activation state before suspending on the awaitable.
    storage.upsert(safa);
    // Call step() recursively with the eventual result or error.
    var onFulfilled = function (value) { return step(safa, null, value); };
    onFulfilled._slow = { type: 'SlowAsyncFunctionActivationContinuationWithResult', safa: safa };
    var onRejected = function (error) { return step(safa, error); };
    onRejected._slow = { type: 'SlowAsyncFunctionActivationContinuationWithError', safa: safa };
    awaiting.then(onFulfilled, onRejected);
}
// TODO: register slow object type with storage (for rehydration logic)
storage.registerType({
    type: 'SlowAsyncFunctionActivationContinuationWithResult',
    rehydrate: function (obj) {
        var onFulfilled = function (value) { return step(obj.safa, null, value); };
        onFulfilled._slow = obj;
        return onFulfilled;
    }
});
// TODO: register slow object type with storage (for rehydration logic)
storage.registerType({
    type: 'SlowAsyncFunctionActivationContinuationWithError',
    rehydrate: function (obj) {
        var onRejected = function (error) { return step(obj.safa, error); };
        onRejected._slow = obj;
        return onRejected;
    }
});
module.exports = runToCompletion;
//# sourceMappingURL=runToCompletion.js.map