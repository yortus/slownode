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
import getNextTask = require("./tasks/getNext");
import flushTask = require("./tasks/flush");
import stopTasks = require("./tasks/stop");
export = EventLoop;

class EventLoop implements Types.EventLoop {

	constructor(config: Types.EventLoopConfig) {
		// TODO: Move config validation to seperate module
		if (typeof config.database !== "string") throw new TypeError(errors.InvalidDatabaseName);
		if (config.database.length < 1) throw new TypeError(errors.InvalidDatabaseName);
		if (typeof config.pollInterval !== "number") throw new TypeError(errors.MustBeNumber);
		if (config.pollInterval < 50) throw new Error(errors.InvalidPollDelay);
		if (config.pollInterval === Infinity) throw new Error(errors.NotInfinity)

		config.database += config.database.slice(-3) === ".db" ? "" : ".db";
		this.store = Knex({
			client: "sqlite3",
			connection: {
				filename: config.database
			}
		});

		this.pollInterval = config.pollInterval;

		this.ready = createDatabase(this.store)
			.then(() => this.start())
	}

	store: Knex;
	pollInterval: number = 1000;
	subscribers: Array<Types.Subscriber> = [];
	ready: Promise<boolean>;
	flushCallback: NodeJS.Timer;

	stop = stopTasks;
	start = flushTask;

	subscribe = addHandler;
	getNextTask = getNextTask;
	getHandler = getHandler;
	removeHandler = removeHandler;

	publish = addTask;
	runTask = runTask;
	removeTask = removeTask;
}
