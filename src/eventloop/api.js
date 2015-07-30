var errors = require("../errors");
var Knex = require("knex");
var store = require("../store/eventLoop");
var processEvent = require("./calls/run");
var flushEvent = require("./calls/flush");
var stopEvents = require("./calls/stop");
var EventLoop = (function () {
    function EventLoop(config) {
        this.config = config;
        this.stop = stopEvents.bind(this);
        this.start = flushEvent.bind(this);
        this.addCall = store.add.bind(this);
        this.processCall = processEvent.bind(this);
        this.removeCall = store.remove.bind(this);
        this.getNextCall = store.getNext.bind(this);
        // TODO: Move config validation to seperate module
        if (typeof config.database !== "string")
            throw new TypeError(errors.InvalidDatabaseName);
        if (config.database.length < 1)
            throw new TypeError(errors.InvalidDatabaseName);
        if (typeof config.pollIntervalMs !== "number")
            throw new TypeError(errors.MustBeNumber);
        if (config.pollIntervalMs < 50)
            throw new Error(errors.InvalidPollDelay);
        if (config.pollIntervalMs === Infinity)
            throw new Error(errors.NotInfinity);
        config.database += config.database.slice(-3) === ".db" ? "" : ".db";
        this.store = Knex({
            client: "sqlite3",
            connection: {
                filename: config.database
            }
        });
    }
    return EventLoop;
})();
module.exports = EventLoop;
//# sourceMappingURL=api.js.map