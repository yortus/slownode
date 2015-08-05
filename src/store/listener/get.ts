import Types = require("slownode");
import SlowNode = require("../../index");
export = get;

function get(event: string): Promise<Types.Schema.EventListener[]> {
	return SlowNode.connection("listener")
		.select()
		.where("topic", "=", event);
}