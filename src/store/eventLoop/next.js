var SlowNode = require("../../index");
function next() {
    var now = Date.now();
    return SlowNode.connection("eventLoop")
        .select()
        .where("runAt", ">=", 0)
        .andWhere("runAt", "<=", now)
        .orderBy("id", "asc")
        .limit(1)
        .then(function (calls) { return calls[0]; });
}
module.exports = next;
//# sourceMappingURL=next.js.map