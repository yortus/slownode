var SlowNode = require("../../index");
var db = SlowNode.connection;
function add(listener) {
    return db("listener")
        .insert(listener);
}
exports.default = add;
//# sourceMappingURL=add.js.map