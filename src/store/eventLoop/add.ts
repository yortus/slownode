import Promise = require("bluebird");
import Types = require("slownode");
import SlowNode = require("../../index");
import db = SlowNode.connection;
export = add;

function add(functionId: string, options?: Types.SlowFunctionOptions) {
	options = options || {};
	
	if (typeof options.arguments !== "string")
		options.arguments = JSON.stringify(options.arguments || []);
		 
	var storable = toStorableCall(functionId, options);

	return db("eventLoop")
		.insert(storable);
}

function toStorableCall(functionId: string, options?: Types.SlowFunctionOptions): Types.Schema.EventLoop {
	var options = options || {};
	var runAt = options.runAt || 0;
	var runAtReadable = new Date(runAt).toString();

	options.arguments = options.arguments || {};

	return {
		funcId: functionId,
		runAt: runAt,
		runAtReadable: runAtReadable,
		arguments: JSON.stringify(options.arguments)
	};
}