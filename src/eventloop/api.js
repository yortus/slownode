var errors = require("../errors");
var createDatabase = require("./createDatabase");
var Knex = require("knex");
var removeSubscriber = require("./subscribers/remove");
var addSubscriber = require("./subscribers/add");
var addEvent = require("./events/add");
var processEvent = require("./events/run");
var removeEvent = require("./events/remove");
var getNextEvent = require("./events/getNext");
var flushEvent = require("./events/flush");
var stopEvents = require("./events/stop");
var EventLoop = (function () {
    function EventLoop(config) {
        var _this = this;
        this.config = config;
        this.pollInterval = 1000;
        this.subscribers = [];
        this.stop = stopEvents.bind(this);
        this.start = flushEvent.bind(this);
        this.subscribe = addSubscriber.bind(this);
        this.removeSubscriber = removeSubscriber.bind(this);
        this.publish = addEvent.bind(this);
        this.processEvent = processEvent.bind(this);
        this.removeEvent = removeEvent.bind(this);
        this.getNextEvent = getNextEvent.bind(this);
        // TODO: Move config validation to seperate module
        if (typeof config.database !== "string")
            throw new TypeError(errors.InvalidDatabaseName);
        if (config.database.length < 1)
            throw new TypeError(errors.InvalidDatabaseName);
        if (typeof config.pollInterval !== "number")
            throw new TypeError(errors.MustBeNumber);
        if (config.pollInterval < 50)
            throw new Error(errors.InvalidPollDelay);
        if (config.pollInterval === Infinity)
            throw new Error(errors.NotInfinity);
        config.database += config.database.slice(-3) === ".db" ? "" : ".db";
        this.store = Knex({
            client: "sqlite3",
            connection: {
                filename: config.database
            }
        });
        this.pollInterval = config.pollInterval;
        this.ready = createDatabase(this.store)
            .then(function () { return _this.start(); });
    }
    return EventLoop;
})();
module.exports = EventLoop;
//# sourceMappingURL=api.js.map