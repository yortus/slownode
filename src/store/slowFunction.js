var toStorable = require("../slowFunction/toStorable");
var SlowNode = require("../index");
var db = SlowNode.connection;
var eventLoopStore = require("./eventLoop");
var errors = require("../errors");
var QueryBuilder = db("");
function add(slowFunction) {
    var options = slowFunction.options || {};
    var storableFunc = toStorable(slowFunction);
    slowFunction.id = storableFunc.id;
    return db("function").insert(storableFunc);
}
exports.add = add;
function addTimed(slowFunction) {
    if (!slowFunction.options)
        throw new Error(errors.TimedFuncsMustHaveOptions);
    var storableFn = toStorable(slowFunction);
    // db.transaction(trx=> {
    // 	return trx.insert(storableFn)
    // 		.into("function")
    // 		.then(() => trx.insert(;
    // })
}
exports.addTimed = addTimed;
function get(functionId) {
    return db("function")
        .select()
        .where("id", "=", functionId);
}
exports.get = get;
function addToEventLoop(slowFunction, storable) {
    var opts = slowFunction.options || {};
    if (opts.runAt === 0) {
        return Promise.resolve(slowFunction.id);
    }
    var query = eventLoopStore.add(slowFunction.id, {
        runAt: opts.runAt,
        dependencies: opts.dependencies || [],
        intervalMs: storable.intervalMs,
        retryCount: storable.retryCount,
        retryIntervalMs: storable.retryIntervalMs
    }).then(function () { return Promise.resolve(slowFunction.id); });
    return query;
}
//# sourceMappingURL=slowFunction.js.map