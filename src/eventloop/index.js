var store = require("../store/index");
exports.add = store.addCall;
exports.exec = require("./exec");
exports.remove = store.removeCall;
exports.getNext = store.nextCall;
function flush() {
    return exports.getNext()
        .then(exports.exec)
        .catch(function (err) {
        // TODO: Remove from event loop or retry...
        throw err;
    })
        .done(function () { });
}
exports.flush = flush;
//# sourceMappingURL=index.js.map