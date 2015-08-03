import SlowNode = require("slownode");
import errors = require("../errors");
import Knex = require("knex");

import store = require("../store/eventLoop");
import processEvent = require("./calls/run");
import flushEvent = require("./calls/flush");
import stopEvents = require("./calls/stop");
export = EventLoop;

var EventLoop: SlowNode.SlowEventLoop = {
	add: store.add,
	run: processEvent,
	remove: store.remove,
	getNext: store.getNext,
}
