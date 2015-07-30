import Types = require("slownode");
import errors = require("../errors");
import Knex = require("knex");

import addEvent = require("./events/add");
import processEvent = require("./events/run");
import removeEvent = require("./events/remove");
import getNextEvent = require("./events/getNext");
import flushEvent = require("./events/flush");
import stopEvents = require("./events/stop");
export = EventLoop;

class EventLoop implements Types.SlowEventLoop {

	constructor(public config: Types.EventLoopConfig) {
		// TODO: Move config validation to seperate module
		if (typeof config.database !== "string") throw new TypeError(errors.InvalidDatabaseName);
		if (config.database.length < 1) throw new TypeError(errors.InvalidDatabaseName);
		if (typeof config.pollIntervalMs !== "number") throw new TypeError(errors.MustBeNumber);
		if (config.pollIntervalMs < 50) throw new Error(errors.InvalidPollDelay);
		if (config.pollIntervalMs === Infinity) throw new Error(errors.NotInfinity)

		config.database += config.database.slice(-3) === ".db" ? "" : ".db";
		this.store = Knex({
			client: "sqlite3",
			connection: {
				filename: config.database
			}
		});
	}

	store: Knex;
	ready: Promise<boolean>;
	flushCallback: NodeJS.Timer;

	stop = stopEvents.bind(this);
	start = flushEvent.bind(this);

	publish = addEvent.bind(this);
	processEvent = processEvent.bind(this);
	removeEvent = removeEvent.bind(this);
	getNextEvent = getNextEvent.bind(this);
}
