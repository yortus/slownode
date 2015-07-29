import Types = require("event-loop");
import errors = require("./errors");
import createDatabase = require("./createDatabase");
import Knex = require("knex");
import rowToTask = require("./toTask");
import taskToRow = require("./toRow");
import getHandler = require("./handlers/get");
import removeHandler = require("./handlers/remove");
import addHandler = require("./handlers/add");
import addTask = require("./tasks/add");
import runTask = require("./tasks/run");
import removeTask = require("./tasks/remove");
export = EventLoop;

class EventLoop implements Types.EventLoop {

	constructor(databaseName: string, pollingDelay: number) {
		if (typeof databaseName !== "string") throw new TypeError(errors.InvalidDatabaseName);
		if (databaseName.length < 1) throw new TypeError(errors.InvalidDatabaseName);
		if (typeof pollingDelay !== "number") throw new TypeError(errors.MustBeNumber);
		if (pollingDelay < 50) throw new Error(errors.InvalidPollDelay);
		if (pollingDelay === Infinity) throw new Error(errors.NotInfinity)

		databaseName += ".db";
		this.store = Knex({
			client: "sqlite3",
			connection: {
				filename: databaseName
			}
		});

		this.pollingDelay = pollingDelay;

		this.ready = createDatabase(this.store)
			.then(() => this.flush())			
	}

	store: Knex;
	pollingDelay: number = 1000;
	taskHandlers: Types.TaskIndex = {};
	ready: Promise<boolean>;
	flushCallback: NodeJS.Timer;
	
	stop = () => {
		if (this.flushCallback) clearTimeout(this.flushCallback);
	} 
	
	flush = () => {
		this.fetchNext()
			.then(this.runTask)
		return true;
	};	

	fetchNext = () => {
		return this.store("tasks")
			.select()
			.where("runAt", "<=", Date.now())
			.orderBy("runAt", "asc")
			.orderBy("id", "asc")
			.limit(1)
			.then((rows: Types.TaskSchema[]) => rows.length > 0 ? this.toTask(rows[0]) : null);
	};
	
	addHandler = addHandler;
	getHandler = getHandler;
	removeHandler = removeHandler;
	
	addTask = addTask;
	runTask = runTask;
	removeTask = removeTask;

}
