var store = require("../store/eventLoop");
var serialise = require("./serialise");
function immediate(func) {
    var serialisedFunc = serialise(func);
    return store.add({
        arguments: "[]",
        functionId: serialisedFunc,
        runAt: Date.now(),
    });
}
module.exports = immediate;
//# sourceMappingURL=setImmediate.js.map