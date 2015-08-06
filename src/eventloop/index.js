var store = require("../store/index");
exports.add = store.addCall;
exports.exec = require("./exec");
exports.remove = store.removeCall;
exports.getNext = store.nextCall;
function flush() {
    var nextFunc;
    return exports.getNext()
        .then(function (func) { return nextFunc = func; })
        .then(exports.exec)
        .then(function () { return exports.remove(nextFunc.id); })
        .then(function () { return flush(); })
        .catch(function (err) {
        if (!nextFunc)
            return;
        return exports.remove(nextFunc.id)
            .then(function () { throw err; });
    })
        .done(null, function (err) {
        flush();
        throw err;
    });
}
exports.flush = flush;
//# sourceMappingURL=index.js.map