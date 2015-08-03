import Types = require("slownode");
import errors = require("../../errors");
import SlowNode = require("../../index");
export = run;

function run(functionCall?: Types.Schema.EventLoop) {

	if (!functionCall) {
		SlowNode.flushCallback = setTimeout(() => SlowNode.flush(), SlowNode.configuration.pollIntervalMs);
		return Promise.resolve(true);
	}
	
	var runPromise = Promise.resolve(true);
	
	return runPromise;
};