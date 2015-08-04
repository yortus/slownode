var SlowNode = require("../index");
function add(functionId, options) {
    options = options || {};
    var storable = toStorableCall(functionId, options);
    var query = SlowNode.connection("eventLoop")
        .insert(storable);
    if (options.trx)
        query.transacting(options.trx);
    return query;
}
exports.add = add;
function remove(id) {
    return SlowNode.connection("eventLoop")
        .delete()
        .where("id", "=", id)
        .then(function (rows) { return rows > 0; })
        .catch(function () { return false; });
}
exports.remove = remove;
function getNext() {
    var now = Date.now();
    return SlowNode.connection("eventLoop")
        .select()
        .where("runAt", "=", 0)
        .orWhere("runAt", "<=", now)
        .orderBy("id", "asc")
        .limit(1)
        .then(function (calls) { return calls[0]; });
}
exports.getNext = getNext;
function toStorableCall(functionId, options) {
    var options = options || {};
    var runAt = options.runAt || 0;
    var runAtReadable = new Date(runAt).toString();
    options.arguments = options.arguments || {};
    return {
        funcId: functionId,
        runAt: runAt,
        runAtReadable: runAtReadable,
        arguments: JSON.stringify(options.arguments)
    };
}
//# sourceMappingURL=eventLoop.js.map