import Types = require("slownode");
import toStorable = require("../slowFunction/toStorable");
import SlowNode = require("../index");
import eventLoopStore = require("./eventLoop");

export function add(slowFunction: Types.SlowFunction): Promise<string> {
	var options = slowFunction.options || {};
	var storableFunc = toStorable(slowFunction);
	slowFunction.id = storableFunc.id;

	return SlowNode.connection.transaction(trx => {
		options.trx = trx;

		return SlowNode.connection("function")
			.insert(storableFunc)
			.transacting(trx)
			.then(() => addToEventLoop(slowFunction, storableFunc, trx))
			.then(trx.commit)
			.catch(trx.rollback);
	});
}

export function get(functionId: string): Promise<Types.Schema.Function> {
	return SlowNode.connection("function")
		.select()
		.where("id", "=", functionId)
		.then(rows => rows[0]);
}

function addToEventLoop(slowFunction: Types.SlowFunction, storable: Types.Schema.Function, trx) {
	var opts = slowFunction.options || {};
	if (opts.runAt === 0) {
		return Promise.resolve(slowFunction.id);
	}

	var query = eventLoopStore.add(slowFunction.id, {
		trx: trx,
		runAt: opts.runAt,
		dependencies: opts.dependencies || [],
		intervalMs: storable.intervalMs,
		retryCount: storable.retryCount,
		retryIntervalMs: storable.retryIntervalMs
	}).then(() => Promise.resolve(slowFunction.id));

	return query;
}

