var Promise = require("bluebird");
var SlowNode = require("../index");
var db = SlowNode.connection;
var addCall = require("./eventLoop/add");
var nextCall = require("./eventLoop/next");
var removeCall = require("./eventLoop/remove");
var addListener = require("./listener/add");
var getListeners = require("./listener/get");
var removeListener = require("./listener/remove");
var removeListeners = require("./listener/removeAll");
var addFunction = require("./slowFunction/add");
var addTimedFunction = require("./slowFunction/addTimed");
var getFunction = require("./slowFunction/get");
var api = {
    addCall: addCall,
    nextCall: nextCall,
    removeCall: removeCall,
    addListener: addListener,
    getListeners: getListeners,
    removeListener: removeListener,
    removeListeners: removeListeners,
    addFunction: addFunction,
    addTimedFunction: addTimedFunction,
    getFunction: getFunction,
    exec: exec,
    execListeners: execListeners,
};
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
module.exports = api;
//# sourceMappingURL=index.js.map