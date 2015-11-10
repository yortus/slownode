var assert = require('assert');
var persistence = require('../persistence');
var slowEventLoop = require('../eventLoop/slowEventLoop');
var slowTimers = require('../eventLoop/slowTimers');
var SlowPromise = require('../promises/slowPromise');
var SlowClosure = require('../functions/slowClosure');
var SlowAsyncFunction = require('../functions/slowAsyncFunction');
// TODO: ...
function run(epochId, slowMain) {
    // TODO: fully review!!!
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var epoch = createEpoch(epochId);
    epoch.setTimeout.apply(epoch, [slowMain, 0].concat(args));
    // TODO: temp testing...
    //var epochId = 'DEFAULT';
    return epoch;
}
exports.run = run;
// TODO: ...
function weakRef(obj) {
    persistence.weakRef(obj);
}
exports.weakRef = weakRef;
// TODO: ...
function on(eventId, handler) {
    assert(eventId === 'end');
    slowEventLoop.addExitHandler(handler);
}
exports.on = on;
// TODO: temp testing...
function createEpoch(epochId) {
    var epoch = {
        setTimeout: null,
        clearTimeout: slowTimers.clearTimeout,
        Promise: SlowPromise.forEpoch(epochId),
        closure: SlowClosure.forEpoch(epochId),
        async: null,
        id: epochId
    };
    epoch.setTimeout = slowTimers.setTimeout.forEpoch(epochId, epoch);
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