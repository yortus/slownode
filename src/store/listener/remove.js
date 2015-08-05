var SlowNode = require("../../index");
function remove(event) {
    return SlowNode.connection("listener")
        .delete()
        .where("topic", "=", event)
        .limit(1);
}
module.exports = remove;
//# sourceMappingURL=remove.js.map