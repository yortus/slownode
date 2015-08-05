var SlowNode = require("../../index");
var db = SlowNode.connection;
function add(listener) {
    return db("listener")
        .insert(listener);
}
module.exports = add;
//# sourceMappingURL=add.js.map