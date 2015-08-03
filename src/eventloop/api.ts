import SlowNode = require("slownode");
import errors = require("../errors");
import Knex = require("knex");

import store = require("../store/eventLoop");
import processEvent = require("./calls/run");
import flushCall = require("./calls/flush");
import stopEvents = require("./calls/stop");

export var add = store.add;
export var run = processEvent;
export var remove = store.remove;
export var getNext = store.getNext;
export var flush = flushCall;