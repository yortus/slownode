import Types = require("slownode");
import SlowNode = require("../../index");
import db = SlowNode.connection;

export default function next(): Promise<Types.Schema.EventLoop> {
	var now = Date.now();

	return db("eventLoop")
		.select()
		.where("runAt", "=", 0)
		.orWhere("runAt", "<=", now)
		.orderBy("id", "asc")
		.limit(1)
		.then(calls => calls[0]);
}
