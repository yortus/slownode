var EventLoop = require("./index");
var store = require("../store/index");
var deserialise = require("../slowFunction/deserialise");
var SlowNode = require("../index");
var funcCache = [];
function callFunc(funcCall) {
    var startTime = Date.now();
    if (!funcCall) {
        SlowNode.flushCallback = setTimeout(function () { return EventLoop.flush(); }, SlowNode.configuration.pollIntervalMs);
        return Promise.resolve(true);
    }
    // TODO: Fail/retry logic
    return getSlowFunc(funcCall.funcId)
        .then(function (func) { return createCall(func, funcCall); });
}
function getSlowFunc(funcId) {
    var cachedFunc = funcCache[funcId];
    if (cachedFunc)
        return Promise.resolve(cachedFunc);
    return store.getFunction(funcId)
        .then(cacheFunc);
}
function cacheFunc(rawFunc) {
    var deserialisedFunc = deserialise(rawFunc);
    funcCache[rawFunc.id] = deserialisedFunc;
    return deserialisedFunc;
}
function createCall(slowFunc, call) {
    var args = JSON.parse(call.arguments);
    var result = slowFunc.body(args);
    return result;
}
module.exports = callFunc;
//# sourceMappingURL=exec.js.map