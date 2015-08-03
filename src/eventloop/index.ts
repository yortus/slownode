import SlowNode = require("slownode");
import errors = require("../errors");
import Knex = require("knex");

import store = require("../store/eventLoop");
import execCall = require("./exec");
import runLoop = require("./runLoop");
import stopEvents = require("./stop");

export var add = store.add;
export var exec = execCall;
export var remove = store.remove;
export var getNext = store.getNext;
export var flush = runLoop;