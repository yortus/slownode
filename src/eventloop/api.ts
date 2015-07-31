import Types = require("slownode");
import errors = require("../errors");
import Knex = require("knex");

import store = require("../store/eventLoop");
import processEvent = require("./calls/run");
import flushEvent = require("./calls/flush");
import stopEvents = require("./calls/stop");
export = EventLoop;

var EventLoop: Types.SlowEventLoop = {
	pollIntervalMs: 1000,
	flushCallback: null,
	stop: stopEvents.bind(this),
	start: flushEvent.bind(this),

	addCall: store.add.bind(this),
	processCall: processEvent.bind(this),
	removeCall: store.remove.bind(this),
	getNextCall: store.getNext.bind(this),
}
