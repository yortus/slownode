var SlowNode = require("../../index");
function get(functionId) {
    return SlowNode.connection("function")
        .select()
        .where("id", "=", functionId)
        .then(function (funcs) { return funcs[0]; });
}
module.exports = get;
//# sourceMappingURL=get.js.map