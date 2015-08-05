import Promise = require("bluebird");
import errors = require("../errors");
import Knex = require("knex");
import { connection as db} from "../index";
export = create;

var tables = ["function", "eventLoop", "listener", "promise"];

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

	var promises = [
		db.schema.createTable("function", functionTable),
		db.schema.createTable("eventLoop", eventLoopTable),
		db.schema.createTable("listener", listenerTable),
		db.schema.createTable("promise", promiseTable)
	];

	return Promise.all(promises)
		.then(() => true);
}

function functionTable(table: any) {
	table.text("id").unique();
	table.text("body");
	table.text("dependencies");
	table.integer("isPromise").defaultTo(0); // 0 | 1
	table.bigInteger("intervalMs").defaultTo(0);
	table.integer("retryCount").defaultTo(0); // 0 -> N
	table.bigInteger("retryIntervalMs").defaultTo(0);
}

function eventLoopTable(table: any) {
	table.increments("id").primary();
	table.text("funcId");
	table.bigInteger("runAt").defaultTo(0); // 0 --> N
	table.text("runAtReadable").defaultTo("Immediately");
	table.text("arguments").defaultTo("{}"); // JSON array
}

function listenerTable(table: any) {
	table.increments("id").primary();
	table.text("topic");
	table.text("funcId");
	table.integer("runOnce").defaultTo(0);
}

function promiseTable(table: any) {
	table.increments("id").primary();
	table.text("funcId");
	table.integer("state").defaultTo(0);
	table.integer("onFulfill").defaultTo(0);
	table.integer("onReject").defaultTo(0);
	table.text("value");
}