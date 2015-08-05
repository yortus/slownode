import Types = require("slownode");
import SlowNode = require("../../index");
export = remove;

function remove(event: string) {
	return SlowNode.connection("listener")
		.delete()
		.where("topic", "=", event)
		.limit(1);
}
