var settings = require("../../settings");
// TODO: Type definition
function get(promiseId) {
    return settings
        .connection("promise")
        .select()
        .where("id", "=", promiseId)
        .leftJoin("function", "promise.onReject", "function.id");
}
module.exports = get;
//# sourceMappingURL=get.js.map