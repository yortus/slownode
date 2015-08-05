var SlowNode = require("../../index");
var db = SlowNode.connection;
function removeAll(event) {
    return db("listener")
        .delete()
        .where("topic", "=", event);
}
exports.default = removeAll;
//# sourceMappingURL=removeAll.js.map