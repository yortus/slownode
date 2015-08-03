var immediate = require("./function/setImmediate");
var timeout = require("./function/setTimeout");
var interval = require("./function/setInterval");
var createDb = require("./store/db");
var eventLoop = require("./eventLoop/api");
var startSlowNode = require("./start");
var stopSlowNode = require("./stop");
exports.configuration = null;
exports.connection = createDb();
exports.flushCallback = null;
exports.start = startSlowNode;
exports.stop = stopSlowNode;
exports.setTimeout = timeout;
exports.setImmediate = immediate;
exports.setInterval = interval;
exports.Promise = null;
exports.Event = null;
function flush() {
    eventLoop.getNext()
        .then(eventLoop.run);
}
exports.flush = flush;
//# sourceMappingURL=index.js.map