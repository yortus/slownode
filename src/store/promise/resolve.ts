import SlowNode = require("../../index");
import Types = require("slownode");
export = resolve;

function resolve(promiseId: number) {
	
	return SlowNode
		.connection("promise")
		.update({ state: 1 })
		.where("id", "=", promiseId);	
}