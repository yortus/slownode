import SlowNode = require("slownode");
import errors = require("../errors");
import Knex = require("knex");
import store = require("../store/index");

export import add = store.addCall;
export import exec = require("./exec");
export import remove = store.removeCall;
export import getNext = store.nextCall;

export function flush() {
	return getNext().then(exec);
}