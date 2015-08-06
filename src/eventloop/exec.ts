import Types = require("slownode");
import EventLoop = require("./index");
import store = require("../store/index");
import deserialise = require("../slowFunction/deserialise");
import SlowNode = require("../index");
export = callFunc;

function callFunc(funcCall?: Types.Schema.EventLoop): any {
	var startTime = Date.now();
	if (!funcCall) {
		SlowNode.flushCallback = setTimeout(() => EventLoop.flush(), SlowNode.configuration.pollIntervalMs);
		return Promise.resolve(true);
	}
	
	return getSlowFunc(funcCall.funcId)
		.then(func => createCall(func, funcCall));
}

function getSlowFunc(funcId: string) {

	return store.getFunction(funcId)
		.then(cacheFunc);
}

function cacheFunc(rawFunc: Types.Schema.Function) {
	var deserialisedFunc = deserialise(rawFunc);

	return deserialisedFunc;
}


function createCall(slowFunc: Types.ISlowFunction, call: Types.Schema.EventLoop) {
	var args = JSON.parse(call.arguments);
	
	var result = slowFunc.body.apply(slowFunc.body, args);
	return result;
}