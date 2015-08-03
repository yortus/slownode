var SlowNode = require("../../index");
var functionStore = require("../../store/function");
var deserialise = require("../../function/deserialise");
var functionCache = [];
function callFunction(functionCall) {
    if (!functionCall) {
        SlowNode.flushCallback = setTimeout(function () { return SlowNode.flush(); }, SlowNode.configuration.pollIntervalMs);
        return Promise.resolve(true);
    }
    var cachedFunc = functionCache[functionCall.functionId];
    if (cachedFunc) {
        return createCall(cachedFunc, functionCall);
    }
    return functionStore.get(functionCall.functionId)
        .then(cacheFunction)
        .then(function (func) { return createCall(func, functionCall); });
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
    return slowFunction.body.call(this, args);
}
module.exports = callFunction;
//# sourceMappingURL=run.js.map