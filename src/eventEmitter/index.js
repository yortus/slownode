var SlowNode = require("../index");
var store = require("../store/index");
var deserialise = require("../slowFunction/deserialise");
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
    return SlowNode.connection.transaction(function (trx) {
        store
            .addFunction(func).transacting(trx)
            .then(function () { return listenRow.funcId = func.id; })
            .then(function () { return store.addListener(listenRow).transacting(trx); })
            .then(trx.commit)
            .catch(trx.rollback);
    })
        .then(function () { return true; })
        .catch(function (err) { return false; });
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
    return store.getListeners(event);
}
exports.listeners = listeners;
function emit(event) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var toFunc = function (func) {
        var fn = deserialise(func).body;
        return fn.apply(fn, args);
    };
    return listeners(event)
        .then(function (funcs) { return funcs.map(toFunc); })
        .then(function () { return true; });
}
exports.emit = emit;
//# sourceMappingURL=index.js.map