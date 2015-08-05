import Types = require("slownode");
import SlowNode = require("../../index");
export = removeAll;

function removeAll(event: string) {
	return SlowNode.connection("listener")
		.delete()
		.where("topic", "=", event);
}