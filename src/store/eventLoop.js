var index_1 = require("../index");
function call(functionId, options) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var storable = toStorableCall(functionId, options, args);
    return index_1.connection("eventloop")
        .insert(storable)
        .then(function (ids) { return ids[0]; });
}
exports.call = call;
function remove(functionId) {
    return index_1.connection("eventloop")
        .delete()
        .where("id", "=", functionId)
        .then(function (rows) { return rows > 0; })
        .catch(function () { return false; });
}
exports.remove = remove;
function getNext() {
    var now = Date.now();
    return index_1.connection("eventloop")
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
    var runAt = Date.now() + (options.runAt || 0);
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