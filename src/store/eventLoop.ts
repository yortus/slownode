import Types = require("slownode");
import { connection as db} from "../index";
import toStorable = require("../function/toStorable");

export function add(func: Types.SlowFunction): Promise<number> {

	var runAt = func.runAt || Date.now();
	var args = JSON.stringify(func.arguments || {});

	return db("eventloop")
		.insert({
			functionId: func.functionId,
			runAt: runAt,
			runAtReadable: new Date(runAt).toString(),
			arguments: func.arguments
		})
		.then((ids: number[]) => ids[0]);
}

export function remove(func: number|Types.SlowFunction): Promise<boolean> {
	var id = typeof func === "number"
		? func
		: func.id;

	return db("eventloop")
		.delete()
		.where("id", "=", id)
		.then(rows => rows > 0)
		.catch(() => false);
}

export function getNext(): Promise<Types.SlowFunction> {
	var now = Date.now();

	return db("eventloop")
		.select()
		.where("runAt", "=", 0)
		.orWhere("runAt", "<=", now)
		.orderBy("id", "asc")
		.limit(1)
		.then(toSlowFunction);
}

function toSlowFunction(funcs: Types.Schema.EventLoop[]): Types.SlowFunction {
	if (funcs.length === 0) return null;

	return {
		id: funcs[0].id,
		functionId: funcs[0].functionId,
		runAt: funcs[0].runAt,
		arguments: JSON.parse(funcs[0].arguments)
	}
}