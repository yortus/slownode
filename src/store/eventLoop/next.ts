import Types = require("slownode");
import SlowNode = require("../../index");
export = next;

function next(): Promise<Types.Schema.EventLoop> {
	var now = Date.now();

	return SlowNode.connection("eventLoop")
		.select()
		.where("runAt", ">=", 0)
		.andWhere("runAt", "<=", now)
		.orderBy("id", "asc")
		.limit(1)
		.then(calls => Promise.resolve(calls[0]));
}
