var SlowNode = require("../../index");
function next() {
    var now = Date.now();
    return SlowNode.connection("eventLoop")
        .select()
        .where("runAt", ">=", 0)
        .andWhere("runAt", "<=", now)
        .orderBy("id", "asc")
        .limit(1)
        .then(echo)
        .then(function (calls) { return calls[0]; });
}
function echo(calls) {
    console.log(calls);
    return calls;
}
module.exports = next;
//# sourceMappingURL=next.js.map