import Types = require("slownode");
import { connection as db} from "../index";

export function add(functionId: string, options?: Types.SlowFunctionOptions, ...args: any[]): Promise<number> {
	var storable = toStorableCall(functionId, options, args);

	return db("eventloop")
		.insert(storable)
		.then((ids: number[]) => ids[0]);
}

export function remove(functionId: string): Promise<boolean> {
	return db("eventloop")
		.delete()
		.where("id", "=", functionId)
		.then(rows => rows > 0)
		.catch(() => false);
}

export function getNext(): Promise<Types.Schema.EventLoop> {
	var now = Date.now();

	return db("eventloop")
		.select()
		.where("runAt", "=", 0)
		.orWhere("runAt", "<=", now)
		.orderBy("id", "asc")
		.limit(1)
		.then(calls => calls[0]);
}

function toStorableCall(functionId: string, options?: Types.SlowFunctionOptions, ...args: any[]): Types.Schema.EventLoop {
	var options = options || {};
	var runAt = Date.now() + (options.runAt || 0);
	var runAtReadable = new Date(runAt).toString();
	args = args || [];
	
	return {
		functionId: functionId,
		runAt: runAt,
		runAtReadable: runAtReadable,
		arguments: JSON.stringify(args)
	};
}