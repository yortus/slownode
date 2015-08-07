var SlowNode = require("../../index");
function add(promise) {
    // State validation?
    return SlowNode
        .connection("promise")
        .insert(promise);
}
module.exports = add;
//# sourceMappingURL=add.js.map