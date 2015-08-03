import Types = require("slownode");
import SlowNode = require("../index");

export function add(functionId: string, options?: Types.SlowFunctionOptions, ...args: any[]): Promise<number> {
	options = options || {};
	var storable = toStorableCall(functionId, options, args);

	var query = SlowNode.connection("eventloop")
		.insert(storable);

	if (options.trx) query.transacting(options.trx);

	return query;
}

export function remove(functionId: string): Promise<boolean> {
	return SlowNode.connection("eventloop")
		.delete()
		.where("id", "=", functionId)
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

function toStorableCall(functionId: string, options?: Types.SlowFunctionOptions, ...args: any[]): Types.Schema.EventLoop {
	var options = options || {};
	var runAt = options.runAt || 0;
	var runAtReadable = new Date(runAt).toString();
	args = args || [];

	return {
		functionId: functionId,
		runAt: runAt,
		runAtReadable: runAtReadable,
		arguments: JSON.stringify(args)
	};
}