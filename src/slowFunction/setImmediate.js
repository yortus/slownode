var store = require("../store/slowFunction");
function immediate(func, options) {
    options = options || {};
    options.runAt = Date.now();
    options.intervalMs = 0;
    return store.add({
        body: func,
        options: options
    });
}
module.exports = immediate;
//# sourceMappingURL=setImmediate.js.map