import Promise = require("bluebird")
import Types = require("slownode");
import SlowNode = require("../index");
import db = SlowNode.connection;
import store = require("../store/index");

/**
 * 
 * Implicit events when adding/removing listeners:
 * 'newListener'
 * 'removeListener'
 * 
 */


export function addListener(event: string, listener: (...args: any[]) => any, options?: Types.SlowFunctionOptions) {
	options = options || {};
	options.runAt = -1;
	var func: Types.SlowFunction = {
		body: listener,
		options: options
	};

	var listenRow: Types.Schema.EventListener = {
		topic: event,
		funcId: ""
	}

	return db.transaction(trx => {
		store
			.addFunction(func)
			.transacting(trx)
			.then(ids => listenRow.funcId = ids[0])
			.then(() => store.addListener(listenRow).transacting(trx))
			.then(trx.commit)
			.catch(trx.rollback)
	});
}

export function on(event: string, listener: (...args: any[]) => any, options?: Types.SlowFunctionOptions) {
	return addListener(event, listener, options);
}

export function once(event: string, listener: (...args: any[]) => any, options?: Types.SlowFunctionOptions) {
	options = options || {};
	options.callOnce = 1;

	return addListener(event, listener, options);
}

export function removeListener(event: string) {

}

export function removeListeners(event: string) {

}

export function listeners(event: string) {

}

export function emit(event: string, ...args: any[]): Promise<boolean> {

	return db.transaction(trx => {
		
		var toCall = (l: Types.Schema.EventListener) => store
			.addCall(l.funcId, { arguments: args })
			.transacting(trx);

		store.getListeners(event)
			.then(listeners => listeners.map(toCall))
			.then(Promise.all)
			.then(trx.commit)
			.catch(trx.rollback)
			
	}).then(() => true);

}