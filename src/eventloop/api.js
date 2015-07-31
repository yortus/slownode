var store = require("../store/eventLoop");
var processEvent = require("./calls/run");
var flushEvent = require("./calls/flush");
var stopEvents = require("./calls/stop");
var EventLoop = {
    pollIntervalMs: 1000,
    flushCallback: null,
    stop: stopEvents.bind(this),
    start: flushEvent.bind(this),
    addCall: store.add.bind(this),
    processCall: processEvent.bind(this),
    removeCall: store.remove.bind(this),
    getNextCall: store.getNext.bind(this),
};
module.exports = EventLoop;
//# sourceMappingURL=api.js.map