import Promise = require("bluebird");
import Types = require("slownode");
import SlowNode = require("../index");
import db = SlowNode.connection;
import toStorable = require("../slowFunction/toStorable");
import errors = require("../errors");

export import addCall = require("./eventLoop/add");
export import nextCall = require("./eventLoop/next");

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




export function addListener(listener: Types.Schema.EventListener) {
	return db("listener")
		.insert(listener);
}

export function getListeners(event: string) {
	return db("listener")
		.select()
		.where("topic", "=", event);
}

export function removeListener(event: string) {
	return db("listener")
		.delete()
		.where("topic", "=", event)
		.limit(1);
}

export function removeListeners(event: string) {
	return db("listener")
		.delete()
		.where("topic", "=", event);
}

export function addFunction(slowFunction: Types.SlowFunction) {
	var storableFunc = toStorable(slowFunction);

	return db("function").insert(storableFunc);
}

export function addTimedFunction(slowFunction: Types.SlowFunction) {
	if (!slowFunction.options) throw new Error(errors.TimedFuncsMustHaveOptions);	

	var storableFn = toStorable(slowFunction);
	// TODO...
}

export function getFunction(functionId: string): Promise<Types.Schema.Function> {
	return db("function")
		.select()
		.where("id", "=", functionId)
}