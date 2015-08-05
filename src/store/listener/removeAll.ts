import Types = require("slownode");
import SlowNode = require("../../index");
import db = SlowNode.connection;

export default function removeAll(event: string) {
	return db("listener")
		.delete()
		.where("topic", "=", event);
}