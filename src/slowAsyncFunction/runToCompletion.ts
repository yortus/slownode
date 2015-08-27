import assert = require('assert');
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
function runToCompletion(safa: Types.SlowAsyncFunctionActivation) {

    // Proceed in a (recursive) loop until the SlowAsyncFunctionActivation either returns or throws.
    safa._slow.awaiting.then(value => step(safa, null, value), error => step(safa, error));
}


function step(safa: Types.SlowAsyncFunctionActivation, error?: any, next?: any) {

    // Resume coro.
    try {
        var yielded = arguments.length === 1 ? safa.throw(error) : safa.next(next);
    }

    // Coro threw.
    catch (ex) {
        storage.remove(safa._slow);
        safa._slow.reject(ex);
        return;
    }

    // Coro returned.
    if (yielded.done) {
        storage.remove(safa._slow);
        safa._slow.resolve(yielded.value);
        return;
    }

    // Coro yielded.
    var awaiting: Types.SlowPromise<any> = safa._slow.awaiting = yielded.value;
    assert(awaiting && typeof awaiting.then === 'function', 'await: expected argument to be a Promise');
    storage.update(safa._slow);
    awaiting.then(value => step(safa, null, value), error => step(safa, error));
}
