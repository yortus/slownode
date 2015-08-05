import Promise = require("bluebird");
import Types = require("slownode");
import SlowNode = require("../index");
import errors = require("../errors");

export import addCall = require("./eventLoop/add");
export import nextCall = require("./eventLoop/next");
export import removeCall = require("./eventLoop/remove");

export import addListener = require("./listener/add");
export import getListeners = require("./listener/get");
export import removeListener = require("./listener/remove");
export import removeListeners = require("./listener/removeAll");

export import addFunction = require("./slowFunction/add");
export import addTimedFunction = require("./slowFunction/addTimed");
export import getFunction = require("./slowFunction/get");

export function execListeners(listeners: Types.Schema.EventListener[], args: any[]) {
	var hasListeners = listeners.length === 0;
	if (!hasListeners) return Promise.resolve(false);

	return SlowNode.connection.transaction(trx => {

		var promises = listeners
			.map(l => exec.apply(l.funcId, args).transacting(trx));

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