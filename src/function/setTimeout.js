var store = require("../store/eventLoop");
var serialise = require("./serialise");
function timeout(func, delayMs) {
    var serialisedFunc = serialise(func);
    return store.add({
        arguments: "[]",
        functionId: serialisedFunc,
        runAt: Date.now() + delayMs,
    });
}
module.exports = timeout;
//# sourceMappingURL=setTimeout.js.map