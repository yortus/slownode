var assert = require('assert');
var Promise = require('bluebird');
var SlowRoutineFunction = require('../slowRoutine/slowRoutineFunction');
var async = (function (bodyFunc) {
    var sloroFunc = new SlowRoutineFunction(bodyFunc, { yieldIdentifier: 'await', constIdentifier: '__const' });
    var result = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var sloro = sloroFunc.apply(sloroFunc, args);
        return new Promise(function (resolve, reject) {
            // Start executing...
            resume();
            // This is the async runner.
            function resume(error, next) {
                try {
                    var yielded = arguments.length !== 1 ? sloro.next(next) : sloro.throw(error);
                    if (yielded.done) {
                        resolve(yielded.value);
                        return;
                    }
                    var p = yielded.value;
                    assert(p && typeof p.then === 'function', 'await: expected argument to be a Promise');
                    p.then(function (result) { return resume(null, result); }, function (error) { return resume(error); });
                }
                catch (ex) {
                    reject(ex);
                    return;
                }
            }
        });
    };
    return result;
});
module.exports = async;
//# sourceMappingURL=async.js.map