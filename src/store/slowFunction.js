var toStorable = require("../slowFunction/toStorable");
var SlowNode = require("../index");
function add(slowFunction) {
    var storableFunc = toStorable(slowFunction);
    return SlowNode.connection("function")
        .insert(storableFunc)
        .then(function (ids) { return ids[0]; });
}
exports.add = add;
function get(functionId) {
    return SlowNode.connection("function")
        .select()
        .where("id", "=", functionId)
        .then(function (rows) { return rows[0]; });
}
exports.get = get;
//# sourceMappingURL=slowFunction.js.map