var Promise = require("bluebird");
var SlowNode = require("../index");
var db = SlowNode.connection;
var store = require("../store/index");
/**
 *
 * Implicit events when adding/removing listeners:
 * 'newListener'
 * 'removeListener'
 *
 */
function addListener(event, listener, options) {
    options = options || {};
    options.runAt = -1;
    var func = {
        body: listener,
        options: options
    };
    var listenRow = {
        topic: event,
        funcId: ""
    };
    return db.transaction(function (trx) {
        store
            .addFunction(func)
            .transacting(trx)
            .then(function (ids) { return listenRow.funcId = ids[0]; })
            .then(function () { return store.addListener(listenRow).transacting(trx); })
            .then(trx.commit)
            .catch(trx.rollback);
    });
}
exports.addListener = addListener;
function on(event, listener, options) {
    return addListener(event, listener, options);
}
exports.on = on;
function once(event, listener, options) {
    options = options || {};
    options.callOnce = 1;
    return addListener(event, listener, options);
}
exports.once = once;
function removeListener(event) {
}
exports.removeListener = removeListener;
function removeListeners(event) {
}
exports.removeListeners = removeListeners;
function listeners(event) {
}
exports.listeners = listeners;
function emit(event) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return db.transaction(function (trx) {
        var toCall = function (l) { return store
            .addCall(l.funcId, { arguments: args })
            .transacting(trx); };
        store.getListeners(event)
            .then(function (listeners) { return listeners.map(toCall); })
            .then(Promise.all)
            .then(trx.commit)
            .catch(trx.rollback);
    }).then(function () { return true; });
}
exports.emit = emit;
//# sourceMappingURL=index.js.map