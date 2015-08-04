import Promise = require("bluebird");
import errors = require("../errors");
import Knex = require("knex");
import { connection as db} from "../index";
export = create;

var tables = ["function", "eventLoop", "event", "eventListener", "promise"];

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
		db.schema.createTable("eventLoop", eventLoopTable),
		db.schema.createTable("eventListener", eventListenersTable),
		db.schema.createTable("promise", promiseTable)];

	return Promise.all(promises)
		.then(() => true);
}

function functionTable(table: any) {
	table.text("id").unique();
	table.text("body");
	table.text("dependencies");
	table.integer("callOnce").default(0); // 0 | 1
	table.integer("isPromise").defaultTo(0); // 0 | 1
	table.bigInteger("intervalMs");
	table.integer("retryCount"); // 0 -> N
	table.bigInteger("retryIntervalMs");
}

function eventLoopTable(table: any) {
	table.increments("id").primary();
	table.text("funcId");
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

function promiseTable(table: any) {
	table.increments("id").primary();
	table.text("funcId");
	table.integer("state");
	table.integer("onFulfill");
	table.integer("onReject");
	table.text("value");
}