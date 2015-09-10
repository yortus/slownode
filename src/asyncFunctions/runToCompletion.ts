import assert = require('assert');
import types = require('types');
import storage = require('../storage/storage');
export = runToCompletion;


/**
 * Runs the given SlowAsyncFunctionActivation instance to completion. First, the activation
 * (which must be currently suspended) is resumed, either passing the given `next` value into
 * it, or throwing the given `error` value into it. If neither `error` or `next` is given, it
 * is resumed with 'undefined' as its next value.
 * If the activation returns or throws, then the activation's promise is settled accordingly.
 * If the activation yields, then it goes back into a suspended state. The yielded value must
 * be an awaitable value. A recursive call to runToCompletion() is scheduled for when the
 * awaitable value is settled. Thus an asynchronous 'loop' is executed until the activation
 * either returns or throws.
 */
function runToCompletion(safa: types.SlowAsyncFunction.Activation, error?: any, next?: any) {

    // Resume the underlying Steppable by either throwing into it or calling next(), depending on args.
    try {
        var yielded;
        if (arguments.length === 1) yielded = safa.next();              // Resume as start (first call)
        else if (arguments.length === 2) yielded = safa.throw(error);   // Resume with awaited's error
        else yielded = safa.next(next);                                 // Resume with awaited's result
    }

    // The Steppable threw. Finalize and reject the SlowAsyncFunctionActivation.
    catch (ex) {
        var s = safa._slow;
        s.reject(ex);

        // Synchronise with the persistent object graph.
        storage.deleted(s.resolve, s.reject, s.onAwaitedResult, s.onAwaitedError, safa);
        return;
    }

    // The Steppable returned. Finalize and resolve the SlowAsyncFunctionActivation.
    if (yielded.done) {
        var s = safa._slow;
        s.resolve(yielded.value);

        // Synchronise with the persistent object graph.
        storage.deleted(s.resolve, s.reject, s.onAwaitedResult, s.onAwaitedError, safa);
        return;
    }

    // The Steppable yielded. Ensure the yielded value is awaitable.
    // TODO: review awaitability checks, supported values/types, and error handling
    var awaiting: types.SlowPromise = safa._slow.awaiting = yielded.value;
    assert(awaiting && typeof awaiting.then === 'function', 'await: expected argument to be a Promise');

    // Attach fulfilled/rejected handlers to the awaitable, which resume the steppable.
    awaiting.then(safa._slow.onAwaitedResult, safa._slow.onAwaitedError);

    // Synchronise with the persistent object graph.
    storage.updated(safa);

    // TL;DR: Now is a good time to ensure that the persistent object graph has been flushed to storage.
    // At this point, we know an asynchronous operation has just got underway, i.e., the operation
    // whose outcome is represented by the awaitable. Therefore a yield to the event loop is most
    // likely imminent. We want to be sure that the persistent object graph has been safely flushed
    // to storage, so that if the process dies between now and when the awaitable resolves, then when
    // it restarts we can pick up where we left off by reloading the persisted state.
    storage.saveState();
}
