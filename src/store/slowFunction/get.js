var SlowNode = require("../../index");
var db = SlowNode.connection;
function get(functionId) {
    return db("function")
        .select()
        .where("id", "=", functionId);
}
exports.default = get;
//# sourceMappingURL=get.js.map