var errors = require("./errors");
var createDatabase = require("./createDatabase");
var Knex = require("knex");
var getHandler = require("./handlers/get");
var removeHandler = require("./handlers/remove");
var addHandler = require("./handlers/add");
var addTask = require("./tasks/add");
var runTask = require("./tasks/run");
var removeTask = require("./tasks/remove");
var getNextTask = require("./tasks/getNext");
var flushTask = require("./tasks/flush");
var stopTasks = require("./tasks/stop");
var EventLoop = (function () {
    function EventLoop(config) {
        var _this = this;
        this.pollInterval = 1000;
        this.subscribers = [];
        this.stop = stopTasks;
        this.start = flushTask;
        this.subscribe = addHandler;
        this.getNextTask = getNextTask;
        this.getHandler = getHandler;
        this.removeHandler = removeHandler;
        this.publish = addTask;
        this.runTask = runTask;
        this.removeTask = removeTask;
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
//# sourceMappingURL=index.js.map