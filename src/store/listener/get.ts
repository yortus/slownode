import Types = require("slownode");
import SlowNode = require("../../index");
export = get;

function get(event: string) {

	return SlowNode.connection("listener")
		.select()
		.where("topic", "=", event)
		.innerJoin("function", "listener.funcId", "function.id");
}