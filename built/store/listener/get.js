var SlowNode = require("../../index");
function get(event) {
    return SlowNode.connection("listener")
        .select()
        .where("topic", "=", event)
        .innerJoin("function", "listener.funcId", "function.id");
}
module.exports = get;
//# sourceMappingURL=get.js.map