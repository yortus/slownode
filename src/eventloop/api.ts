import SlowNode = require("slownode");
import errors = require("../errors");
import Knex = require("knex");

import store = require("../store/eventLoop");
import processEvent = require("./calls/run");
import flushEvent = require("./calls/flush");
import stopEvents = require("./calls/stop");
export = EventLoop;

var EventLoop: SlowNode.SlowEventLoop = {
	add: store.add.bind(this),
	run: processEvent.bind(this),
	remove: store.remove.bind(this),
	getNext: store.getNext.bind(this),
}
