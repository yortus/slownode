var _this = this;
var errors = require("../errors");
var add = function (handler) {
    var self = _this;
    var taskHandler = self.getHandler(handler.topicFilter, handler.functionId);
    if (!!taskHandler)
        throw new Error(errors.FunctionExists);
    if (!self.subscribers[handler.topicFilter])
        self.subscribers[handler.topicFilter] = {};
    self.subscribers[handler.topicFilter][handler.functionId] = handler;
    return true;
};
module.exports = add;
//# sourceMappingURL=add.js.map