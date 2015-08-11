var store = require("../store/index");
function timeout(func, delayMs, options) {
    options = options || {};
    options.intervalMs = 0;
    options.runAt = Date.now() + delayMs;
    return store
        .addTimedFunction({
        body: func,
        options: options
    });
}
module.exports = timeout;
//# sourceMappingURL=setTimeout.js.map