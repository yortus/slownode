var store = require("../store/slowFunction");
function interval(func, delayMs, options) {
    options = options || {};
    options.runAt = Date.now();
    options.intervalMs = delayMs;
    return store.add({
        body: func,
        options: options
    });
}
module.exports = interval;
//# sourceMappingURL=setInterval.js.map