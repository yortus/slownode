import Types = require("slownode");
import immediate = require("./function/setImmediate");
import timeout = require("./function/setTimeout");
import interval = require("./function/setInterval");

import startSlowNode = require("./start");
import stopSlowNode = require("./stop");

export var configuration = null;
export var connection = null;

export var start = startSlowNode;
export var stop = stopSlowNode;

export var setTimeout = timeout;
export var setImmediate = immediate;
export var setInterval = interval;

export var EventEmitter = null;
export var EventLoop = null;
export var Promise = null;
