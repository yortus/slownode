import Types = require("slownode");
import errors = require("../errors");
import Knex = require("knex");
import store = require("../store/index");

export import add = store.addCall;
export import exec = require("./exec");
export import remove = store.removeCall;
export import getNext = store.nextCall;

export function flush() {
	var nextFunc: Types.Schema.EventLoop;

	return getNext()
		.then((func: Types.Schema.EventLoop) => nextFunc = func)
		.then(exec)
		.then(() => remove(nextFunc.id))
		.then(() => flush())
		.catch(err => {
			if (!nextFunc) return;

			return remove(nextFunc.id)
				.then(() => { throw err });
		})
		.done(null, err => {
			flush();
			throw err;
		});
}