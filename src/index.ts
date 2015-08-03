import Knex = require("knex");
import Types = require("slownode");
import immediate = require("./slowFunction/setImmediate");
import timeout = require("./slowFunction/setTimeout");
import interval = require("./slowFunction/setInterval");
import createDb = require("./store/db");

import eventLoop = require("./eventLoop/api");
import startSlowNode = require("./start");
import stopSlowNode = require("./stop");


export var configuration: Types.Config = null;
export var connection: Knex = createDb();
export var flushCallback: NodeJS.Timer = null;

export var start = startSlowNode;
export var stop = stopSlowNode;

export var setTimeout = timeout;
export var setImmediate = immediate;
export var setInterval = interval;

export var Promise = null;
export var Event = null;