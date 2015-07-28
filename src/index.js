var errors = require("./errors");
var createDatabase = require("./createDatabase");
var Knex = require("knex");
var rowToTask = require("./toTask");
var taskToRow = require("./toRow");
var EventLoop = (function () {
    function EventLoop(databaseName, pollingDelay) {
        var _this = this;
        this.pollingDelay = 1000;
        this.taskHandlers = {};
        this.stop = function () {
            if (_this.flushCallback)
                clearTimeout(_this.flushCallback);
        };
        this.flush = function () {
            _this.fetchNext()
                .then(_this.runTask);
            return true;
        };
        this.fetchNext = function () {
            return _this.store("tasks")
                .select()
                .where("runAt", "<=", Date.now())
                .orderBy("runAt", "asc")
                .orderBy("id", "asc")
                .limit(1)
                .then(function (rows) { return rows.length > 0 ? _this.toTask(rows[0]) : null; });
        };
        /**
         * Handler operations
         */
        this.addTaskHandler = function (handler) {
            var taskHandler = _this.getTaskHandler(handler.topicFilter, handler.functionId);
            if (!!taskHandler)
                throw new Error(errors.FunctionExists);
            if (!_this.taskHandlers[handler.topicFilter])
                _this.taskHandlers[handler.topicFilter] = {};
            _this.taskHandlers[handler.topicFilter][handler.functionId] = handler;
            return true;
        };
        this.removeTaskHandler = function (topicFilter, functionId) {
            var topicTasks = _this.taskHandlers[topicFilter] || {};
            var isExisting = !!topicTasks[functionId];
            if (!isExisting)
                return false;
            return delete _this.taskHandlers[topicFilter][functionId];
        };
        this.getTaskHandler = function (topicFilter, functionId) {
            var topicTasks = _this.taskHandlers[topicFilter] || {};
            return topicTasks[functionId];
        };
        /**
         * Task operations
         */
        this.runTask = function (task) {
            if (!task) {
                _this.flushCallback = setTimeout(function () { return _this.flush(); }, _this.pollingDelay);
                return Promise.resolve(true);
            }
            var handler = _this.getTaskHandler(task.topicFilter, task.functionId);
            if (!handler)
                throw new Error(errors.NoHandler);
            return handler.callback(task.task)
                .then(function () { return _this.removeTask(task); })
                .then(function () { return true; });
        };
        this.removeTask = function (task) {
            return _this.store("tasks")
                .delete()
                .where("id", "=", task.id);
        };
        this.addTask = function (task) {
            var row = _this.toRow(task);
            return _this.store("tasks")
                .insert(row);
        };
        this.toTask = rowToTask;
        this.toRow = taskToRow;
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
        databaseName += ".db";
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