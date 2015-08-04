var SlowNode = require("../index");
function get(id) {
    return SlowNode.connection("promise")
        .select()
        .where("id", "=", id)
        .then(function (promises) { return promises[0]; });
}
exports.get = get;
//# sourceMappingURL=promise.js.map