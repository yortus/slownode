var _this = this;
var errors = require("../errors");
var run = function (task) {
    var self = _this;
    if (!task) {
        self.flushCallback = setTimeout(function () { return self.flushTask(); }, self.pollingDelay);
        return Promise.resolve(true);
    }
    var handler = self.getHandler(task.topicFilter, task.functionId);
    if (!handler)
        throw new Error(errors.NoHandler);
    return handler.callback(task.task)
        .then(function () { return self.removeTask(task); })
        .then(function () { return true; });
};
module.exports = run;
//# sourceMappingURL=run.js.map