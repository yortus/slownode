import SlowNode = require("../../index");
import Types = require("slownode");
export = reject;

function reject(promiseId: number) {
	
	return SlowNode
		.connection("promise")
		.update({ state: 2 })
		.where("id", "=", promiseId);	
}