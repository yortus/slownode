import Types = require("event-loop");
import errors = require("./errors");
import createDatabase = require("./createDatabase");
import Knex = require("knex");
import rowToTask = require("./toTask");
import taskToRow = require("./toRow");
import getSubscriber = require("./subscribers/get");
import removeSubscriber = require("./subscribers/remove");
import addSubscriber = require("./subscribers/add");
import addEvent = require("./events/add");
import processEvent = require("./events/run");
import removeEvent = require("./events/remove");
import getNextEvent = require("./events/getNext");
import flushEvent = require("./events/flush");
import stopEvents = require("./events/stop");
export = EventLoop;

class EventLoop implements Types.EventLoop {

	constructor(public config: Types.EventLoopConfig) {
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
	pollInterval = 1000;
	subscribers: Array<Types.Subscriber> = [];
	ready: Promise<boolean>;
	flushCallback: NodeJS.Timer;

	stop = stopEvents;
	start = flushEvent;

	subscribe = addSubscriber;
	removeSubscriber = removeSubscriber;

	publish = addEvent;
	processEvent = processEvent;
	removeEvent = removeEvent;
	getNextEvent = getNextEvent;
}
