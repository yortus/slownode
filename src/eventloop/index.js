var store = require("../store/index");
exports.add = store.addCall;
exports.exec = require("./exec");
exports.remove = store.removeCall;
exports.getNext = store.nextCall;
function flush() {
    return exports.getNext().then(exports.exec);
}
exports.flush = flush;
//# sourceMappingURL=index.js.map