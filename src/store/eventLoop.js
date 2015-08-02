var index_1 = require("../index");
function add(func) {
    var runAt = func.runAt || Date.now();
    var args = JSON.stringify(func.arguments || {});
    return index_1.connection("eventloop")
        .insert({
        functionId: func.functionId,
        runAt: runAt,
        runAtReadable: new Date(runAt).toString(),
        arguments: func.arguments
    })
        .then(function (ids) { return ids[0]; });
}
exports.add = add;
function remove(func) {
    var id = typeof func === "number"
        ? func
        : func.id;
    return index_1.connection("eventloop")
        .delete()
        .where("id", "=", id)
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
        .then(toSlowFunction);
}
exports.getNext = getNext;
function toSlowFunction(funcs) {
    if (funcs.length === 0)
        return null;
    return {
        id: funcs[0].id,
        functionId: funcs[0].functionId,
        runAt: funcs[0].runAt,
        arguments: JSON.parse(funcs[0].arguments)
    };
}
//# sourceMappingURL=eventLoop.js.map