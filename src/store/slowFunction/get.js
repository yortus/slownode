var SlowNode = require("../../index");
function get(functionId) {
    return SlowNode.connection("function")
        .select()
        .where("id", "=", functionId);
}
module.exports = get;
//# sourceMappingURL=get.js.map