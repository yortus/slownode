var assert = require('assert');
var persistence = require('../persistence');
var slowTimers = require('../eventLoop/slowTimers');
var SlowPromise = require('../promises/slowPromise');
var SlowClosure = require('../functions/slowClosure');
var SlowAsyncFunction = require('../functions/slowAsyncFunction');
function open(path, flags) {
    // TODO: fully review!!!
    // TODO: temp testing...
    var epochId = 'TEST';
    var epoch = createEpoch(epochId);
    return epoch;
}
exports.open = open;
function close(epoch) {
    // TODO: explicit disposal...
}
exports.close = close;
// TODO: temp testing...
function createEpoch(epochId) {
    var epoch = {
        setTimeout: slowTimers.setTimeout.forEpoch(epochId),
        clearTimeout: slowTimers.clearTimeout,
        Promise: SlowPromise.forEpoch(epochId),
        closure: SlowClosure.forEpoch(epochId),
        async: null,
        addWeakRef: function (obj) {
            assert(obj && (typeof obj === 'object' || typeof obj === 'function'), 'addWeakRef: argument must be an object');
            assert(!obj.$slow, 'addWeakRef: argument is already a slow object');
            obj.$slow = { kind: 60 /* WeakRef */ };
            persistence.created(obj);
        },
        id: epochId
    };
    epoch.async = createAsyncFunctionForEpoch(epoch);
    return epoch;
}
// TODO: temp testing...
function createAsyncFunctionForEpoch(epoch) {
    var async = SlowAsyncFunction.forEpoch(epoch.id);
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