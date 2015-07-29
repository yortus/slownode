var _this = this;
var get = function (topicFilter, functionId) {
    var self = _this;
    var topicHandlers = self.subscribers[topicFilter] || {};
    return topicHandlers[functionId] || null;
};
module.exports = get;
//# sourceMappingURL=get.js.map