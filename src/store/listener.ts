import Promise = require("bluebird");
import funcStore = require("./slowFunction");
import loopStore = require("./eventLoop");
import SlowNode = require("../index");
import db = SlowNode.connection;
import Types = require("slownode");
import Knex = require("knex");

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