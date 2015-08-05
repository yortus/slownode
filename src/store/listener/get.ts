import Types = require("slownode");
import SlowNode = require("../../index");
import db = SlowNode.connection;
export = get;

function get(event: string) {
	return db("listener")
		.select()
		.where("topic", "=", event);
}