var _this = this;
var errors = require("../errors");
var run = function (task) {
    var self = _this;
    if (!task) {
        self.flushCallback = setTimeout(function () { return self.start(); }, self.pollInterval);
        return Promise.resolve(true);
    }
    var handler = self.getHandler(task.eventName, task.subscriberId);
    if (!handler)
        throw new Error(errors.NoHandler);
    return handler.callback(task.event)
        .then(function () { return self.removeTask(task); })
        .then(function () { return true; });
};
module.exports = run;
//# sourceMappingURL=run.js.map