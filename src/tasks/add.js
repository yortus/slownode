var _this = this;
var store = require("./store");
var add = function (task) {
    var self = _this;
    // var isGenericTask = task.functionId == null;
    // if (isGenericTask) {
    // 	var handlers = 
    // }
    return store(self.store, [task]);
};
module.exports = add;
//# sourceMappingURL=add.js.map