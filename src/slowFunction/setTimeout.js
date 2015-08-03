var store = require("../store/slowFunction");
function timeout(func, delayMs, options) {
    options = options || {};
    options.intervalMs = 0;
    options.runAt = Date.now() + delayMs;
    return store.add({
        body: func,
        options: options
    });
}
module.exports = timeout;
//# sourceMappingURL=setTimeout.js.map