import Promise = require("bluebird");
import Types = require("slownode");
import SlowNode = require("../index");
import errors = require("../errors");

export import addCall = require("./eventLoop/add");
export import nextCall = require("./eventLoop/next");
export import removeCall = require("./eventLoop/remove");

export import addListener = require("./listener/add");
export import getListeners = require("./listener/get");
export import removeListener = require("./listener/remove");
export import removeListeners = require("./listener/removeAll");

export import addFunction = require("./slowFunction/add");
export import addTimedFunction = require("./slowFunction/addTimed");
export import getFunction = require("./slowFunction/get");
