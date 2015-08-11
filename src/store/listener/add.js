var SlowNode = require("../../index");
function add(listener) {
    return SlowNode.connection("listener")
        .insert(listener);
}
module.exports = add;
//# sourceMappingURL=add.js.map