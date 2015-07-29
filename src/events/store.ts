import Knex = require("knex");
import Types = require("event-loop");
import Promise = require("bluebird");
import toRow = require("../toRow");
export = store;

function store(db: Knex, event: Types.Event) {
	return db("tasks")
		.insert(toRow(event));
}