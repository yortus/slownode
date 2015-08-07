var SlowNode = require("../../index");
// TODO: Type definition
function get(promiseId) {
    return SlowNode
        .connection("promise")
        .select()
        .where("id", "=", promiseId)
        .leftJoin("function", "promise.onReject", "function.id");
}
module.exports = get;
//# sourceMappingURL=get.js.map