var SlowNode = require("../../index");
function get(event) {
    return SlowNode.connection("listener")
        .select()
        .where("topic", "=", event);
}
module.exports = get;
//# sourceMappingURL=get.js.map