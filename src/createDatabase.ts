import Promise = require("bluebird");
import errors = require("./errors");
import knex = require("knex");
export = create;

function create(db: knex) {
	return Promise.delay(500)
		.then(() => tableExists(db))
		.then(exists => createTable(db, exists))
		.then(() => Promise.resolve(true));
}

function tableExists(db: knex) {
	return db.schema.hasTable("tasks");
}

function createTable(db: knex, exists: boolean) {
	if (exists) return Promise.resolve(true);

	return db.schema.createTable("tasks", table => {
		table.increments("id").primary();
		table.bigInteger("runAt");
		table.text("runAtReadble");
		table.text("topicFilter");
		table.text("functionId");
		table.text("task");
	}).then(() => Promise.resolve(true));
}