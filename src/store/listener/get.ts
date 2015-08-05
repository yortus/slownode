import Types = require("slownode");
import SlowNode = require("../../index");
import db = SlowNode.connection;
export = get;

function get(event: string): Promise<Types.Schema.EventListener[]> {
	return db("listener")
		.select()
		.where("topic", "=", event);
}