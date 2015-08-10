var SlowNode = require("../../index");
function remove(id) {
    return SlowNode.connection("eventLoop")
        .delete()
        .where("id", "=", id);
}
module.exports = remove;
//# sourceMappingURL=remove.js.map