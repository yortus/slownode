var store = require("../store/index");
/**
 *
 * Implicit events when adding/removing listeners:
 * 'newListener'
 * 'removeListener'
 *
 */
function addListener(event, listener) {
}
exports.addListener = addListener;
function on(event, listener) {
    return addListener(event, listener);
}
exports.on = on;
function once(event, listener) {
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
    return store.getListeners(event)
        .then(function (listeners) { return store.execListeners(listeners, args); });
}
exports.emit = emit;
//# sourceMappingURL=index.js.map