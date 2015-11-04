var assert = require('assert');
var EpochLog = require('./epochLog');
var slowEventLoop = require('../eventLoop/slowEventLoop');
var slowTimers = require('../eventLoop/slowTimers');
var SlowPromise = require('../promises/slowPromise');
var SlowClosure = require('../functions/slowClosure');
var SlowAsyncFunction = require('../functions/slowAsyncFunction');
function open(path, flags) {
    // TODO: need orderly attach/detach in pairs. This will never be detached!! And will keep ref to epoch/log alive!
    slowEventLoop.beforeNextTick.attach(function () {
        epochLog.flush();
        return Promise.resolve();
    });
    var epochLog = new EpochLog(path, flags);
    var epoch = createEpoch(epochLog);
    return epoch;
}
exports.open = open;
function close(epoch) {
    // TODO: explicit disposal...
}
exports.close = close;
// TODO: temp testing...
function createEpoch(epochLog) {
    var epoch = {
        setTimeout: slowTimers.setTimeout.forEpoch(epochLog),
        clearTimeout: slowTimers.clearTimeout,
        Promise: SlowPromise.forEpoch(epochLog),
        closure: SlowClosure.forEpoch(epochLog),
        async: null,
        addWeakRef: function (obj) {
            assert(obj && (typeof obj === 'object' || typeof obj === 'function'), 'addWeakRef: argument must be an object');
            assert(!obj.$slow, 'addWeakRef: argument is already a slow object');
            obj.$slow = { kind: 60 /* WeakRef */ };
            epochLog.created(obj);
        },
        log: epochLog
    };
    epoch.async = createAsyncFunctionForEpoch(epoch);
    return epoch;
}
// TODO: temp testing...
function createAsyncFunctionForEpoch(epoch) {
    var async = SlowAsyncFunction.forEpoch(epoch.log);
    var options = { require: require };
    var result = function (bodyFunc) { return async(bodyFunc, options); };
    return result;
    function require(moduleId) {
        if (moduleId === 'epoch')
            return epoch;
        return mainRequire(moduleId);
    }
}
// TODO: temp testing...
var mainRequire = require.main.require;
//# sourceMappingURL=epoch.js.map