var SlowNode = require("../../index");
var db = SlowNode.connection;
function removeAll(event) {
    return db("listener")
        .delete()
        .where("topic", "=", event);
}
module.exports = removeAll;
//# sourceMappingURL=removeAll.js.map