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
    function EventLoop(databaseName, pollingDelay) {
        var _this = this;
        this.pollingDelay = 1000;
        this.taskHandlers = {};
        this.stop = stopTasks;
        this.flush = flushTask;
        this.addHandler = addHandler;
        this.getNextTask = getNextTask;
        this.getHandler = getHandler;
        this.removeHandler = removeHandler;
        this.addTask = addTask;
        this.runTask = runTask;
        this.removeTask = removeTask;
        if (typeof databaseName !== "string")
            throw new TypeError(errors.InvalidDatabaseName);
        if (databaseName.length < 1)
            throw new TypeError(errors.InvalidDatabaseName);
        if (typeof pollingDelay !== "number")
            throw new TypeError(errors.MustBeNumber);
        if (pollingDelay < 50)
            throw new Error(errors.InvalidPollDelay);
        if (pollingDelay === Infinity)
            throw new Error(errors.NotInfinity);
        databaseName += databaseName.slice(-3) === ".db" ? "" : ".db";
        this.store = Knex({
            client: "sqlite3",
            connection: {
                filename: databaseName
            }
        });
        this.pollingDelay = pollingDelay;
        this.ready = createDatabase(this.store)
            .then(function () { return _this.flush(); });
    }
    return EventLoop;
})();
module.exports = EventLoop;
//# sourceMappingURL=index.js.map