import Types = require("slownode");
import SlowNode = require("../../index");

export = remove;

function remove(id: number) {
	return SlowNode.connection("eventLoop")
		.delete()
		.where("id", "=", id);
}