import Types = require("slownode");
import crypto = require("crypto");
import serialise = require("./serialise");
export = toStorable;

function toStorable(slowFunction: Types.SlowFunction): Types.Schema.Function {
	
	var body = serialise(slowFunction.body);
	var id = slowFunction.id || generateFunctionId(body);
	var dependencies = JSON.stringify(slowFunction.dependencies || []);
	
	return {
		id: id,
		body: body,
		dependencies: dependencies,
		intervalMs: slowFunction.intervalMs || 0,
		retryCount: slowFunction.retryCount || 0,
		retryIntervalMs: slowFunction.retryIntervalMs || 0
	};
}

function generateFunctionId(body: string) {
	return crypto.createHash("md5")
		.update(body)
		.digest("hex");
}