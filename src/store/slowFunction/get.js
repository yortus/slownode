var SlowNode = require("../../index");
var db = SlowNode.connection;
function get(functionId) {
    return db("function")
        .select()
        .where("id", "=", functionId);
}
module.exports = get;
//# sourceMappingURL=get.js.map