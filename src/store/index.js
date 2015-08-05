var Promise = require("bluebird");
var SlowNode = require("../index");
var db = SlowNode.connection;
exports.addCall = require("./eventLoop/add");
exports.nextCall = require("./eventLoop/next");
exports.removeCall = require("./eventLoop/remove");
exports.addListener = require("./listener/add");
exports.getListeners = require("./listener/get");
exports.removeListener = require("./listener/remove");
exports.removeListeners = require("./listener/removeAll");
exports.addFunction = require("./slowFunction/add");
exports.addTimedFunction = require("./slowFunction/addTimed");
exports.getFunction = require("./slowFunction/get");
function execListeners(listeners, args) {
    var hasListeners = listeners.length === 0;
    if (!hasListeners)
        return Promise.resolve(false);
    return db.transaction(function (trx) {
        var promises = listeners
            .map(function (l) { return exec.apply(l.funcId, args).transacting(trx); });
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
//# sourceMappingURL=index.js.map