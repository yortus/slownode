var Promise = require("bluebird");
var SlowNode = require("../index");
var db = SlowNode.connection;
var toStorable = require("../slowFunction/toStorable");
var errors = require("../errors");
exports.addCall = require("./eventLoop/add");
exports.nextCall = require("./eventLoop/next");
exports.removeCall = require("./eventLoop/remove");
exports.addListener = require("./listener/add");
exports.getListeners = require("./listener/get");
exports.removeListener = require("./listener/remove");
exports.removeListeners = require("./listener/removeAll");
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