import Types = require("slownode");
import SlowNode = require("../../index");
import db = SlowNode.connection;

export default function add(listener: Types.Schema.EventListener) {
	return db("listener")
		.insert(listener);
}