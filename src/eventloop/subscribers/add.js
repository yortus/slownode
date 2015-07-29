var errors = require("../../errors");
function add(subscriber) {
    var self = this;
    //TODO: Implement replacement logic
    //TODO: Persist the subscriber in the database
    if (!!self.subscribers[subscriber.id])
        throw new Error(errors.FunctionExists);
    self.subscribers[subscriber.id] = subscriber;
    return true;
}
;
module.exports = add;
//# sourceMappingURL=add.js.map