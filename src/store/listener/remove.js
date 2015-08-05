var SlowNode = require("../../index");
var db = SlowNode.connection;
function remove(event) {
    return db("listener")
        .delete()
        .where("topic", "=", event)
        .limit(1);
}
exports.default = remove;
//# sourceMappingURL=remove.js.map