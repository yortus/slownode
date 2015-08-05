var SlowNode = require("../index");
var db = SlowNode.connection;
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
//# sourceMappingURL=listener.js.map