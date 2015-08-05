import Types = require("slownode");
import toStorable = require("../slowFunction/toStorable");
import SlowNode = require("../index");
import db = SlowNode.connection;
import eventLoopStore = require("./eventLoop");
import transact = require("./transact");
import errors = require("../errors");
var QueryBuilder = db("");

export function add(slowFunction: Types.SlowFunction) {
	var options = slowFunction.options || {};
	var storableFunc = toStorable(slowFunction);
	slowFunction.id = storableFunc.id;

	return db("function").insert(storableFunc);
}

export function addTimed(slowFunction: Types.SlowFunction) {
	if (!slowFunction.options) throw new Error(errors.TimedFuncsMustHaveOptions);

	var storableFn = toStorable(slowFunction);

	// db.transaction(trx=> {
	// 	return trx.insert(storableFn)
	// 		.into("function")
	// 		.then(() => trx.insert(;
	// })


}

export function get(functionId: string): Promise<Types.Schema.Function> {
	return db("function")
		.select()
		.where("id", "=", functionId)
}

function addToEventLoop(slowFunction: Types.SlowFunction, storable: Types.Schema.Function) {
	var opts = slowFunction.options || {};
	if (opts.runAt === 0) {
		return Promise.resolve(slowFunction.id);
	}

	var query = eventLoopStore.add(slowFunction.id, {
		runAt: opts.runAt,
		dependencies: opts.dependencies || [],
		intervalMs: storable.intervalMs,
		retryCount: storable.retryCount,
		retryIntervalMs: storable.retryIntervalMs
	}).then(() => Promise.resolve(slowFunction.id));

	return query;
}

