import Types = require("slownode");
import db = require("./db");

export function add(func: Types.SlowFunction) {

	var runAt = func.runAt || Date.now();
	var args = JSON.stringify(func.arguments || {});

	return db("eventloop")
		.insert({
			functionId: func.functionId,
			runAt: runAt,
			runAtReadable: new Date(runAt).toString(),
			arguments: func.arguments
		})
		.then((ids: number[]) => Promise.resolve(ids[0]));
}

export function remove(func: number|Types.SlowFunction) {
	var id = typeof func === "number"
		? func
		: func.id;

	return db("eventloop")
		.delete()
		.where("id", "=", id)
		.then(rows => Promise.resolve(rows > 0));
}