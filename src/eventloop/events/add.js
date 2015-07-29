var store = require("./store");
function add(event) {
    var self = this;
    return store(self.store, event);
}
module.exports = add;
//# sourceMappingURL=add.js.map