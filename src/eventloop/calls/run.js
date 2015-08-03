var EventLoop = require("../api");
var functionStore = require("../../store/slowFunction");
var deserialise = require("../../slowFunction/deserialise");
var SlowNode = require("../../index");
var functionCache = [];
function callFunction(functionCall) {
    if (!functionCall) {
        SlowNode.flushCallback = setTimeout(function () { return EventLoop.flush(); }, SlowNode.configuration.pollIntervalMs);
        return Promise.resolve(true);
    }
    var cachedFunc = functionCache[functionCall.functionId];
    if (cachedFunc) {
        return createCall(cachedFunc, functionCall);
    }
    return functionStore.get(functionCall.functionId)
        .then(cacheFunction)
        .then(function (func) { return createCall(func, functionCall); })
        .then(function () { return EventLoop.flush(); });
}
;
function cacheFunction(rawFunction) {
    var cachedFunc = functionCache[rawFunction.id];
    if (cachedFunc)
        return cachedFunc;
    var deserialisedFunc = deserialise(rawFunction);
    functionCache[rawFunction.id] = deserialisedFunc;
    return deserialisedFunc;
}
function createCall(slowFunction, call) {
    var args = JSON.parse(call.arguments);
    var result = slowFunction.body.call(this, args);
    console.log("[CALL] %s: %s", slowFunction.id, result);
    return result;
}
module.exports = callFunction;
//# sourceMappingURL=run.js.map