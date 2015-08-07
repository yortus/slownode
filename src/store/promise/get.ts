import SlowNode = require("../../index");
import Types = require("slownode");
export = get;

// TODO: Type definition
function get(promiseId: number) {
	
	return SlowNode
		.connection("promise")
		.select()
		.where("id", "=", promiseId)
		.leftJoin("function", "promise.onReject", "function.id");
}