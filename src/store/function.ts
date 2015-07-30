import Types = require("slownode");
import db = require("./db");

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