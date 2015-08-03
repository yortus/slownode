var functionStore = require("../store/function");
function immediate(slowFunction) {
    // TODO: Rules/logic...
    return functionStore.add(slowFunction);
}
module.exports = immediate;
//# sourceMappingURL=setImmediate.js.map