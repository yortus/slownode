var store = require("../store/index");
function immediate(func, options) {
    options = options || {};
    options.runAt = 0;
    options.intervalMs = 0;
    return store
        .addTimedFunction({
        body: func,
        options: options
    });
}
module.exports = immediate;
//# sourceMappingURL=setImmediate.js.map