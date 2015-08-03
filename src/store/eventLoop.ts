import Types = require("slownode");
import SlowNode = require("../index");

export function add(functionId: string, options?: Types.SlowFunctionOptions): Promise<number> {
	options = options || {};
	var storable = toStorableCall(functionId, options);

	var query = SlowNode.connection("eventloop")
		.insert(storable);

	if (options.trx) query.transacting(options.trx);

	return query;
}

export function remove(id: number): Promise<boolean> {
	return SlowNode.connection("eventloop")
		.delete()
		.where("id", "=", id)
		.then(rows => rows > 0)
		.catch(() => false);
}

export function getNext(): Promise<Types.Schema.EventLoop> {
	var now = Date.now();

	return SlowNode.connection("eventloop")
		.select()
		.where("runAt", "=", 0)
		.orWhere("runAt", "<=", now)
		.orderBy("id", "asc")
		.limit(1)
		.then(calls => calls[0]);
}

function toStorableCall(functionId: string, options?: Types.SlowFunctionOptions): Types.Schema.EventLoop {
	var options = options || {};
	var runAt = options.runAt || 0;
	var runAtReadable = new Date(runAt).toString();
	
	options.arguments = options.arguments || {};

	return {
		funcId: functionId,
		runAt: runAt,
		runAtReadable: runAtReadable,
		arguments: JSON.stringify(options.arguments)
	};
}