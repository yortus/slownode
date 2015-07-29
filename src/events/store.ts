import Knex = require("knex");
import Types = require("event-loop");
import Promise = require("bluebird");
import toRow = require("../toRow");
export = store;

function store(db: Knex, tasks: Array<Types.Event>) {

	return db.transaction(trx => {
		return Promise.map(tasks, task => toInsert(db, task, trx))
			.then(trx.commit)
	});

}

function toInsert(db: Knex, task: Types.Event, trx: any) {
	return db("tasks")
		.insert(toRow(task))
		.transacting(trx);
}