var immediate = require("./function/setImmediate");
var timeout = require("./function/setTimeout");
var interval = require("./function/setInterval");
var start = require("./start");
var SlowNode = {
    configuration: null,
    start: start,
    exit: null,
    setTimeout: timeout,
    setImmediate: immediate,
    setInterval: interval,
    EventEmitter: null,
    EventLoop: null,
    Promise: null,
};
module.exports = SlowNode;
//# sourceMappingURL=index.js.map