var SlowNode = require("../index");
function add(functionId, options) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    options = options || {};
    var storable = toStorableCall(functionId, options, args);
    var query = SlowNode.connection("eventloop")
        .insert(storable);
    if (options.trx)
        query.transacting(options.trx);
    return query;
}
exports.add = add;
function remove(functionId) {
    return SlowNode.connection("eventloop")
        .delete()
        .where("id", "=", functionId)
        .then(function (rows) { return rows > 0; })
        .catch(function () { return false; });
}
exports.remove = remove;
function getNext() {
    var now = Date.now();
    return SlowNode.connection("eventloop")
        .select()
        .where("runAt", "=", 0)
        .orWhere("runAt", "<=", now)
        .orderBy("id", "asc")
        .limit(1)
        .then(function (calls) { return calls[0]; });
}
exports.getNext = getNext;
function toStorableCall(functionId, options) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var options = options || {};
    var runAt = options.runAt || 0;
    var runAtReadable = new Date(runAt).toString();
    args = args || [];
    return {
        functionId: functionId,
        runAt: runAt,
        runAtReadable: runAtReadable,
        arguments: JSON.stringify(args)
    };
}
//# sourceMappingURL=eventLoop.js.map