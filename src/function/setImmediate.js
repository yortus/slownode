var functionStore = require("../store/function");
function immediate(func, options) {
    // TODO: Rules/logic...
    options = options || {};
    options.runAt = Date.now();
    options.intervalMs = 0;
    var slowFunction = {
        body: func,
        options: options
    };
    return functionStore.add(slowFunction);
}
module.exports = immediate;
//# sourceMappingURL=setImmediate.js.map