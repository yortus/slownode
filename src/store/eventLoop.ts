import Promise = require("bluebird");
import Types = require("slownode");
import SlowNode = require("../index");
import db = SlowNode.connection;

export function add(functionId: string, options?: Types.SlowFunctionOptions) {
	options = options || {};
	var storable = toStorableCall(functionId, options);

	return db("eventLoop")
		.insert(storable);
}

export function execListeners(listeners: Types.Schema.EventListener[], args: any[]) {
	var hasListeners = listeners.length === 0;
	if (!hasListeners) return Promise.resolve(false);

	return db.transaction(trx => {

		var promises = listeners
			.map(l => exec.apply(l.functionId, args).transacting(trx));

		return Promise.all(promises)
			.then(trx.commit)
			.catch(trx.rollback);
	}).then(() => true);
}

export function exec(functionId: string, ...args: any[]) {
	var record = {
		funcId: functionId,
		arguments: JSON.stringify(args)
	};

	return db("eventLoop")
		.insert(record);
}

export function remove(id: number) {
	return db("eventLoop")
		.delete()
		.where("id", "=", id);
}

export function getNext(): Promise<Types.Schema.EventLoop> {
	var now = Date.now();

	return db("eventLoop")
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