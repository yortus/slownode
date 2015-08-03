import Types = require("slownode");
import errors = require("../../errors");
import EventLoop = require("../api");
import functionStore = require("../../store/slowFunction");
import deserialise = require("../../slowFunction/deserialise");
import SlowNode = require("../../index");
export = callFunction;

var functionCache: Array<Types.SlowFunction> = [];

function callFunction(functionCall?: Types.Schema.EventLoop): any {
	if (!functionCall) {
		SlowNode.flushCallback = setTimeout(() => EventLoop.flush(), SlowNode.configuration.pollIntervalMs);
		return Promise.resolve(true);
	}

	var cachedFunc = functionCache[functionCall.functionId];
	if (cachedFunc) {
		return createCall(cachedFunc, functionCall);
	}

	return functionStore.get(functionCall.functionId)
		.then(cacheFunction)
		.then(func => createCall(func, functionCall))
		.then(() => EventLoop.flush());
};

function cacheFunction(rawFunction: Types.Schema.Function) {
	var cachedFunc = functionCache[rawFunction.id];
	if (cachedFunc) return cachedFunc;
	
	var deserialisedFunc = deserialise(rawFunction);
	functionCache[rawFunction.id] = deserialisedFunc;
	
	return deserialisedFunc;
}

function createCall(slowFunction: Types.SlowFunction, call: Types.Schema.EventLoop) {
	var args = JSON.parse(call.arguments);
	
	var result = slowFunction.body.call(this, args);
	console.log("[CALL] %s: %s", slowFunction.id, result);
	return result;
}