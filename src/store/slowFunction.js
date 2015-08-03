var toStorable = require("../slowFunction/toStorable");
var SlowNode = require("../index");
var eventLoopStore = require("./eventLoop");
function add(slowFunction) {
    var options = slowFunction.options || {};
    var storableFunc = toStorable(slowFunction);
    slowFunction.id = storableFunc.id;
    return SlowNode.connection.transaction(function (trx) {
        options.trx = trx;
        return SlowNode.connection("function")
            .insert(storableFunc)
            .transacting(trx)
            .then(function () { return addToEventLoop(slowFunction, storableFunc, trx); })
            .then(trx.commit)
            .catch(trx.rollback);
    });
}
exports.add = add;
function get(functionId) {
    return SlowNode.connection("function")
        .select()
        .where("id", "=", functionId)
        .then(function (rows) { return rows[0]; });
}
exports.get = get;
function addToEventLoop(slowFunction, storable, trx) {
    var opts = slowFunction.options || {};
    if (opts.runAt === 0) {
        return Promise.resolve(slowFunction.id);
    }
    var query = eventLoopStore.add(slowFunction.id, {
        trx: trx,
        runAt: opts.runAt,
        dependencies: opts.dependencies || [],
        intervalMs: storable.intervalMs,
        retryCount: storable.retryCount,
        retryIntervalMs: storable.retryIntervalMs
    }).then(function () { return Promise.resolve(slowFunction.id); });
    return query;
}
//# sourceMappingURL=slowFunction.js.map