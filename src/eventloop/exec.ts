import Types = require("slownode");
import EventLoop = require("./index");
import store = require("../store/index");
import deserialise = require("../slowFunction/deserialise");
import SlowNode = require("../index");
export = callFunc;

var funcCache: Array<Types.SlowFunction> = [];

function callFunc(funcCall?: Types.Schema.EventLoop): any {
	var startTime = Date.now();
	if (!funcCall) {
		SlowNode.flushCallback = setTimeout(() => EventLoop.flush(), SlowNode.configuration.pollIntervalMs);
		return Promise.resolve(true);
	}
	
	// TODO: Fail/retry logic
	return getSlowFunc(funcCall.funcId)
		.then(func => createCall(func, funcCall))
		.then(() => EventLoop.remove(funcCall.id))
		.then(() => EventLoop.flush());
}

function getSlowFunc(funcId: string) {
	var cachedFunc = funcCache[funcId];
	if (cachedFunc) return Promise.resolve(cachedFunc);

	return store.getFunction(funcId)
		.then(cacheFunc);
}

function cacheFunc(rawFunc: Types.Schema.Function) {
	var deserialisedFunc = deserialise(rawFunc);
	funcCache[rawFunc.id] = deserialisedFunc;

	return Promise.resolve(deserialisedFunc);
}


function createCall(slowFunc: Types.SlowFunction, call: Types.Schema.EventLoop) {
	var args = JSON.parse(call.arguments);

	var result = storedFuncWrapper.call({}, slowFunc, args);
	return Promise.resolve(result);
}

function storedFuncWrapper(func: Types.SlowFunction, args?: any) {
	var deps = func.options.dependencies
		.map(dep => `this.${dep.as} = ${inject(dep) }`)
		.join("; ");

	try {
		eval(deps);
		return func.body.call(this, args);
	} catch (ex) {
		// TODO: conditional error handling...
		// TODO: notify...
	}
	
}

function inject(dependency: Types.Dependency) {
	return dependency.reference == null
		? JSON.stringify(dependency.value)
		: `require("${dependency.reference}")`;

}