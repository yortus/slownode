import Promise = require("bluebird");
import errors = require("../errors");
import Knex = require("knex");
import { connection as db} from "../index";
export = create;

var tables = ["functions", "eventloop", "events", "listeners"];

function create() {
	return tablesExists()
		.then(createTable)
		.then(() => Promise.resolve(true));
}

function tablesExists() {
	var toPromise = table => db.schema.hasTable(table);
	return Promise.all(tables.map(toPromise));
}

function createTable(exists: Array<boolean>) {
	if (exists.every(e => e === true)) return Promise.resolve(true);
	if (exists.some(e => e === true)) throw new Error(errors.DatabaseInvalid);
	
	var promises = [db.schema.createTable("event", eventTable),
		db.schema.createTable("function", functionTable),
		db.schema.createTable("eventloop", eventLoopTable),
		db.schema.createTable("eventListener", eventListenersTable)];

	return Promise.all(promises)
		.then(() => true);
}

function functionTable(table: any) {
	table.text("id").unique();
	table.text("body");
	table.text("dependencies");
	table.bigInteger("intervalMs");
	table.integer("retryCount"); // 0 -> N
	table.bigInteger("retryIntervalMs");
}

function eventLoopTable(table: any) {
	table.increments("id").primary();
	table.text("functionId");
	table.bigInteger("runAt"); // 0 --> N
	table.text("runAtReadable");
	table.text("arguments"); // JSON array
}

function eventTable(table: any) {
	table.increments("id").primary();
	table.text("topic");
	table.text("arguments");
	table.bigInteger("createdAt");
	table.text("createdAtReable");
}

function eventListenersTable(table: any) {
	table.increments("id").primary();
	table.text("topic");
	table.text("functionId");
	table.integer("runOnce");
}