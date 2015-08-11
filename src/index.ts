import ready = require('./ready');

export import errors = require('./errors');

export import start = require('./start');
export import stop = require('./stop');

export import setTimeout = require('./slowFunction/setTimeout');
export import setImmediate = require('./slowFunction/setImmediate');
export import setInterval = require('./slowFunction/setInterval');;

export import SlowFunction = require('./slowFunction/declare');
export import EventEmitter = require('./eventEmitter/index');
export import Callback = require('./slowFunction/callback');
