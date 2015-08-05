var SlowNode = require("../../index");
var db = SlowNode.connection;
function remove(id) {
    return db("eventLoop")
        .delete()
        .where("id", "=", id);
}
exports.default = remove;
//# sourceMappingURL=remove.js.map