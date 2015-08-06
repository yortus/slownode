import Knex = require("knex");
import Types = require("slownode");
import createDb = require("./store/db");

export var configuration: Types.Config = null;
export var connection: Knex = createDb();
export var flushCallback: NodeJS.Timer = null;

export import start = require("./start");
export import stop = require("./stop");

export import setTimeout = require("./slowFunction/setTimeout");
export import setImmediate = require("./slowFunction/setImmediate");
export import setInterval = require("./slowFunction/setInterval");;

export var Promise = null;
export import EventEmitter = require("./eventEmitter/index");
export var DEBUG = false;