import Knex = require("knex");
import Types = require("slownode");
import immediate = require("./function/setImmediate");
import timeout = require("./function/setTimeout");
import interval = require("./function/setInterval");
import createDb = require("./store/db");

import startSlowNode = require("./start");
import stopSlowNode = require("./stop");

export var configuration: Types.Config = null;
export var connection: Knex = createDb();

export var start = startSlowNode;
export var stop = stopSlowNode;

export var setTimeout = timeout;
export var setImmediate = immediate;
export var setInterval = interval;

export var EventEmitter: Types.SlowEventEmitter = null;
export var EventLoop: Types.SlowEventLoop = null;
export var Promise: Types.SlowPromise = null;