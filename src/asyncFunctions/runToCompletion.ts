import assert = require('assert');
import types = require('types');
import storage = require('../storage/storage');
export = runToCompletion;


// TODO: the following JSDoc is out of date. Revise it...
/**
 * Runs the given SlowAsyncFunctionActivation instance to completion. First, the `awaiting`
 * value is awaited, and then the SlowAsyncFunctionActivation is resumed with the eventual
 * value. Subsequent values yielded by the SlowAsyncFunctionActivation are awaited, and the
 * SlowAsyncFunctionActivation is resumed with their eventual values each time. This process
 * continues until the SlowAsyncFunctionActivation either returns or throws. If it throws,
 * this function rejects with the error. If it returns, this function resolves to its result.
 */
function runToCompletion(safa: types.SlowAsyncFunction.Activation, error?: any, next?: any) {

    // Resume the underlying Steppable, either throwing into it or calling next(), depending on args.
    try {
        var yielded;
        if (arguments.length === 1) yielded = safa.next();              // Resume as start (first call)
        else if (arguments.length === 2) yielded = safa.throw(error);   // Resume with awaited's error
        else yielded = safa.next(next);                                 // Resume with awaited's result
    }

    // The Steppable threw. Finalize and reject the SlowAsyncFunctionActivation.
    catch (ex) {
        safa._slow.reject(ex);

        // Synchronise with the persistent object graph.
        storage.deleted(safa._slow.onAwaitedResult);
        storage.deleted(safa._slow.onAwaitedError);
        storage.deleted(safa);
        return;
    }

    // The Steppable returned. Finalize and resolve the SlowAsyncFunctionActivation.
    if (yielded.done) {
        safa._slow.resolve(yielded.value);

        // Synchronise with the persistent object graph.
        storage.deleted(safa._slow.onAwaitedResult);
        storage.deleted(safa._slow.onAwaitedError);
        storage.deleted(safa);
        return;
    }

    // The Steppable yielded. Ensure the yielded value is awaitable.
    // TODO: review awaitability checks, supported values/types, and error handling
    var awaiting: types.SlowPromise = safa._slow.awaiting = yielded.value;
    assert(awaiting && typeof awaiting.then === 'function', 'await: expected argument to be a Promise');

    // The steppable's state has changed.
    // Synchronise with the persistent object graph.
    storage.updated(safa);

    // TODO: Ensure the persistent object graph is safely stored before potentially yielding to the event loop
    // TODO: This doubles up on the saveState before calling a new SlowPromise's resolver. What to do? If anything?
    //       - for starters: consider whether the awaitable is a SlowPromise or something else. If it *is* a SlowPromise
    //       - we still have to save state because the promise's saveState call is before the storage.updated(safa) call above
    storage.saveState();

    // Suspend on the awaitable, then call self recursively with the eventual result or error.
    awaiting.then(safa._slow.onAwaitedResult, safa._slow.onAwaitedError);
}
