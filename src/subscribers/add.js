var _this = this;
var errors = require("../errors");
var add = function (subscriber) {
    var self = _this;
    //TODO: Implement replacement logic
    //TODO: Persist the subscriber in the database
    if (!!self.subscribers[subscriber.id])
        throw new Error(errors.FunctionExists);
    self.subscribers[subscriber.id] = subscriber;
    return true;
};
module.exports = add;
//# sourceMappingURL=add.js.map