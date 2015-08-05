var store = require("../store/index");
function interval(func, delayMs, options) {
    options = options || {};
    options.runAt = Date.now();
    options.intervalMs = delayMs;
    return store.addFunction({
        body: func,
        options: options
    });
}
module.exports = interval;
//# sourceMappingURL=setInterval.js.map