var store = require("../store/eventLoop");
var serialise = require("./serialise");
function interval(func, delayMs) {
    var serialisedFunc = serialise(func);
    return store.add({
        arguments: "[]",
        functionId: serialisedFunc,
        repeat: 1,
        runAt: Date.now() + delayMs,
    });
}
module.exports = interval;
//# sourceMappingURL=setInterval.js.map