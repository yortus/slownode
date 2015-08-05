var SlowNode = require("../../index");
function removeAll(event) {
    return SlowNode.connection("listener")
        .delete()
        .where("topic", "=", event);
}
module.exports = removeAll;
//# sourceMappingURL=removeAll.js.map