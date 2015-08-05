var Promise = require("bluebird");
var SlowNode = require("../index");
var toStorable = require("../slowFunction/toStorable");
var errors = require("../errors");
var db = SlowNode.connection;
function add(functionId, options) {
    options = options || {};
    var storable = toStorableCall(functionId, options);
    return db("eventLoop")
        .insert(storable);
}
exports.add = add;
function execListeners(listeners, args) {
    var hasListeners = listeners.length === 0;
    if (!hasListeners)
        return Promise.resolve(false);
    return db.transaction(function (trx) {
        var promises = listeners
            .map(function (l) { return exec.apply(l.functionId, args).transacting(trx); });
        return Promise.all(promises)
            .then(trx.commit)
            .catch(trx.rollback);
    }).then(function () { return true; });
}
exports.execListeners = execListeners;
function exec(functionId) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var record = {
        funcId: functionId,
        arguments: JSON.stringify(args)
    };
    return db("eventLoop")
        .insert(record);
}
exports.exec = exec;
function remove(id) {
    return db("eventLoop")
        .delete()
        .where("id", "=", id);
}
exports.remove = remove;
function getNext() {
    var now = Date.now();
    return db("eventLoop")
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
function addListener(listener) {
    return db("listener")
        .insert(listener);
}
exports.addListener = addListener;
function getListeners(event) {
    return db("listener")
        .select()
        .where("topic", "=", event);
}
exports.getListeners = getListeners;
function removeListener(event) {
    return db("listener")
        .delete()
        .where("topic", "=", event)
        .limit(1);
}
exports.removeListener = removeListener;
function removeListeners(event) {
    return db("listener")
        .delete()
        .where("topic", "=", event);
}
exports.removeListeners = removeListeners;
function addFunction(slowFunction) {
    var storableFunc = toStorable(slowFunction);
    return db("function").insert(storableFunc);
}
exports.addFunction = addFunction;
function addTimedFunction(slowFunction) {
    if (!slowFunction.options)
        throw new Error(errors.TimedFuncsMustHaveOptions);
    var storableFn = toStorable(slowFunction);
    // TODO...
}
exports.addTimedFunction = addTimedFunction;
function getFunction(functionId) {
    return db("function")
        .select()
        .where("id", "=", functionId);
}
exports.getFunction = getFunction;
//# sourceMappingURL=index.js.map