var createDb = require("./store/db");
exports.configuration = null;
exports.connection = createDb();
exports.flushCallback = null;
exports.start = require("./start");
exports.stop = require("./stop");
exports.setTimeout = require("./slowFunction/setTimeout");
exports.setImmediate = require("./slowFunction/setImmediate");
exports.setInterval = require("./slowFunction/setInterval");
;
exports.SlowFunction = require("./slowFunction/declare");
exports.EventEmitter = require("./eventEmitter/index");
exports.Callback = require("./slowFunction/callback");
exports.Promise = null;
exports.DEBUG = false;
//# sourceMappingURL=index.js.map