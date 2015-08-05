import SlowNode = require("slownode");
import errors = require("../errors");
import Knex = require("knex");
import store = require("../store/index");
import execCall = require("./exec");
import runLoop = require("./runLoop");
import stopEvents = require("./stop");

export var add = store.addCall;
export var exec = execCall;
export var remove = store.removeCall;
export var getNext = store.nextCall;
export var flush = runLoop;