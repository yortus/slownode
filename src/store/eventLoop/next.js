var SlowNode = require("../../index");
var db = SlowNode.connection;
function next() {
    var now = Date.now();
    return db("eventLoop")
        .select()
        .where("runAt", "=", 0)
        .orWhere("runAt", "<=", now)
        .orderBy("id", "asc")
        .limit(1)
        .then(function (calls) { return calls[0]; });
}
module.exports = next;
//# sourceMappingURL=next.js.map