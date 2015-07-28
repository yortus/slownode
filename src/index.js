var errors = require("./errors");
var knex = require("knex");
var EventLoop = (function () {
    function EventLoop(databaseName, pollingDelay) {
        var _this = this;
        this.pollingDelay = 1000;
        this.taskHandlers = {};
        this.flush = function () {
            _this.fetchNext()
                .then(_this.runTask);
        };
        this.runTask = function (task) {
            if (!task) {
                setTimeout(function () { return _this.flush(); }, _this.pollingDelay);
                return Promise.resolve(true);
            }
            var handler = _this.getTaskHandler(task.topicFilter, task.functionId);
            if (!handler)
                throw new Error(errors.NoHandler);
            return handler.callback(task.task)
                .then(function () { return _this.removeTask(task); })
                .then(function () { return true; });
        };
        this.fetchNext = function () {
            return _this.store("tasks")
                .select()
                .where("runAt", "<=", Date.now())
                .orderBy("runAt", "asc")
                .orderBy("id", "asc")
                .limit(1)
                .then(function (rows) { return _this.toTask(rows[0]) || null; });
        };
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
        this.removeTask = function (task) {
            return _this.store("tasks")
                .delete()
                .where("id", "=", task.id);
        };
        this.store = knex({
            client: "sqlite3",
            connection: {
                filename: databaseName
            }
        });
        this.pollingDelay = pollingDelay;
    }
    EventLoop.prototype.toTask = function (taskRow) {
        return {
            id: taskRow.id,
            topicFilter: taskRow.topicFilter,
            functionId: taskRow.functionId,
            task: JSON.parse(taskRow.task)
        };
    };
    return EventLoop;
})();
//# sourceMappingURL=index.js.map