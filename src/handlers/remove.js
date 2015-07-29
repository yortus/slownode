var _this = this;
var remove = function (topicFilter, functionId) {
    var self = _this;
    var topicTasks = self.taskHandlers[topicFilter] || {};
    var isExisting = !!topicTasks[functionId];
    if (!isExisting)
        return false;
    return delete self.taskHandlers[topicFilter][functionId];
};
module.exports = remove;
//# sourceMappingURL=remove.js.map