import Types = require("slownode");
import SlowNode = require("../../index");
import db = SlowNode.connection;

export default function get(event: string) {
	return db("listener")
		.select()
		.where("topic", "=", event);
}