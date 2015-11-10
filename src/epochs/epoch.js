var assert = require('assert');
var persistence = require('../persistence');
var slowTimers = require('../eventLoop/slowTimers');
var SlowPromise = require('../promises/slowPromise');
var SlowClosure = require('../functions/slowClosure');
var SlowAsyncFunction = require('../functions/slowAsyncFunction');
function run(epochId, slowMain) {
    // TODO: fully review!!!
    var epoch = createEpoch(epochId);
    epoch.setTimeout(slowMain, 0);
    // TODO: temp testing...
    //var epochId = 'DEFAULT';
    return epoch;
}
exports.run = run;
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
// TODO: ==================== rehydration logic... temp testing... ====================
persistence.howToRehydrate(60 /* WeakRef */, function ($slow) {
    return null;
});
//# sourceMappingURL=epoch.js.map