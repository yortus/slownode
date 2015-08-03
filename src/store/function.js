var toStorable = require("../function/toStorable");
var index_1 = require("../index");
function add(slowFunction) {
    var storableFunc = toStorable(slowFunction);
    return index_1.connection("function")
        .insert(storableFunc)
        .then(function (ids) { return ids[0]; });
}
exports.add = add;
function get(functionId) {
    return index_1.connection("function")
        .select()
        .where("id", "=", functionId)
        .then(function (rows) { return rows[0]; });
}
exports.get = get;
//# sourceMappingURL=function.js.map