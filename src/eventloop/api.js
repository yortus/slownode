var store = require("../store/eventLoop");
var processEvent = require("./calls/run");
var flushEvent = require("./calls/flush");
var stopEvents = require("./calls/stop");
var EventLoop = {
    constructor: function (config) {
        // TODO: Move config validation to seperate module
    },
    ready: Promise < boolean > , Promise: .delay(500).then(function () { return true; }),
    flushCallback: NodeJS.Timer,
    stop:  = stopEvents.bind(this),
    start:  = flushEvent.bind(this),
    addCall:  = store.add.bind(this),
    processCall:  = processEvent.bind(this),
    removeCall:  = store.remove.bind(this),
    getNextCall:  = store.getNext.bind(this)
};
module.exports = EventLoop;
//# sourceMappingURL=api.js.map