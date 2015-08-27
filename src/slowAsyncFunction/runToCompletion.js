var assert = require('assert');
var storage = require('../storage/storage');
//TODO: remove async/await from in here...
/**
 * Runs the given SlowAsyncFunctionActivation instance to completion. First, the `awaiting`
 * value is awaited, and then the SlowAsyncFunctionActivation is resumed with the eventual
 * value. Subsequent values yielded by the SlowAsyncFunctionActivation are awaited, and the
 * SlowAsyncFunctionActivation is resumed with their eventual values each time. This process
 * continues until the SlowAsyncFunctionActivation either returns or throws. If it throws,
 * this function rejects with the error. If it returns, this function resolves to its result.
 */
function runToCompletion(safa) {
    // Proceed in a (recursive) loop until the SlowAsyncFunctionActivation either returns or throws.
    safa._slow.awaiting.then(function (value) { return step(safa, null, value); }, function (error) { return step(safa, error); });
}
function step(safa, error, next) {
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
    var awaiting = safa._slow.awaiting = yielded.value;
    assert(awaiting && typeof awaiting.then === 'function', 'await: expected argument to be a Promise');
    storage.update(safa._slow);
    awaiting.then(function (value) { return step(safa, null, value); }, function (error) { return step(safa, error); });
}
module.exports = runToCompletion;
//# sourceMappingURL=runToCompletion.js.map