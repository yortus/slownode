var SlowNode = require("../../index");
var db = SlowNode.connection;
function get(event) {
    return db("listener")
        .select()
        .where("topic", "=", event);
}
module.exports = get;
//# sourceMappingURL=get.js.map