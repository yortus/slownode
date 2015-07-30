import Promise = require("bluebird");
import errors = require("../errors");
import knex = require("knex");
export = create;

var tables = ["functions", "eventloop", "events", "listeners"];

function create(db: knex) {
	return Promise.delay(500)
		.then(() => tablesExists(db))
		.then(exists => createTable(db, exists))
		.then(() => Promise.resolve(true));
}

function tablesExists(db: knex) {
	var toPromise = table => db.schema.hasTable(table);
	return Promise.all(tables.map(toPromise));
}

function createTable(db: knex, exists: Array<boolean>) {
	if (exists.every(e => e === true)) return Promise.resolve(true);
	if (exists.some(e => e === true)) throw new Error(errors.DatabaseInvalid);

	var promises = [db.schema.createTable("events", eventTable),
		db.schema.createTable("functions", functionTable),
		db.schema.createTable("eventloop", eventLoopTable),
		db.schema.createTable("eventListeners", eventListenersTable)];

	return Promise.all(promises)
		.then(() => true);
}

function eventTable(table: any) {
	table.increments("id").primary();
	table.text("topic");
	table.text("arguments");
	table.bigInteger("createdAt");
	table.text("createdAtReable");
}

function functionTable(table: any) {
	table.increments("id").primary();
	table.text("name");
	table.text("function");
}

function eventLoopTable(table: any) {
	table.increments("id").primary();
	table.text("functionId");
	table.integer("runAt"); // 0 --> N
	table.text("runAtReadable");
	table.text("arguments"); // JSON array
}

function eventListenersTable(table: any) {
	table.increments("id").primary();
	table.text("topic");
	table.text("functionId");
	table.integer("runOnce");
}