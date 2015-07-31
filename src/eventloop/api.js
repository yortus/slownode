var errors = require("../errors");
var store = require("../store/eventLoop");
var processEvent = require("./calls/run");
var flushEvent = require("./calls/flush");
var stopEvents = require("./calls/stop");
var EventLoop = (function () {
    function EventLoop(config) {
        this.config = config;
        this.ready = Promise.delay(500).then(function () { return true; });
        this.stop = stopEvents.bind(this);
        this.start = flushEvent.bind(this);
        this.addCall = store.add.bind(this);
        this.processCall = processEvent.bind(this);
        this.removeCall = store.remove.bind(this);
        this.getNextCall = store.getNext.bind(this);
        // TODO: Move config validation to seperate module
        if (typeof config.pollIntervalMs !== "number")
            throw new TypeError(errors.MustBeNumber);
        if (config.pollIntervalMs < 50)
            throw new Error(errors.InvalidPollDelay);
        if (config.pollIntervalMs === Infinity)
            throw new Error(errors.NotInfinity);
    }
    return EventLoop;
})();
module.exports = EventLoop;
//# sourceMappingURL=api.js.map