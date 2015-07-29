var _this = this;
var store = require("./store");
var add = function (task) {
    var self = _this;
    return store(self.store, [task]);
};
module.exports = add;
//# sourceMappingURL=add.js.map