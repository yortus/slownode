import Types = require("slownode");
import SlowNode = require("../../index");
import db = SlowNode.connection;
export = remove;

function remove(id: number) {
	return db("eventLoop")
		.delete()
		.where("id", "=", id);
}