import Promise = require("bluebird");
import Types = require("slownode");
import SlowNode = require("../index");
import db = SlowNode.connection;
import toStorable = require("../slowFunction/toStorable");
import errors = require("../errors");

import addCall = require("./eventLoop/add");
import nextCall = require("./eventLoop/next");
import removeCall = require("./eventLoop/remove");

import addListener = require("./listener/add");
import getListeners = require("./listener/get");
import removeListener = require("./listener/remove");
import removeListeners = require("./listener/removeAll");

import addFunction = require("./slowFunction/add");
import addTimedFunction = require("./slowFunction/addTimed");
import getFunction = require("./slowFunction/get");
export = api;

var api = {
	addCall,
	nextCall,
	removeCall,
	
	addListener,
	getListeners,
	removeListener,
	removeListeners,
	
	addFunction,
	addTimedFunction,
	getFunction,
	
	exec, // ?
	execListeners, // ?
}

function execListeners(listeners: Types.Schema.EventListener[], args: any[]) {
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

function exec(functionId: string, ...args: any[]) {
	var record = {
		funcId: functionId,
		arguments: JSON.stringify(args)
	};

	return db("eventLoop")
		.insert(record);
}
















