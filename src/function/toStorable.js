var crypto = require("crypto");
var serialise = require("./serialise");
function toStorable(slowFunction) {
    var body = serialise(slowFunction.body);
    var id = slowFunction.id || generateFunctionId(body);
    var dependencies = JSON.stringify(slowFunction.dependencies || []);
    return {
        id: id,
        body: body,
        dependencies: dependencies,
        intervalMs: slowFunction.intervalMs || 0,
        retryCount: slowFunction.retryCount || 0,
        retryIntervalMs: slowFunction.retryIntervalMs || 0
    };
}
function generateFunctionId(body) {
    return crypto.createHash("md5")
        .update(body)
        .digest("hex");
}
module.exports = toStorable;
//# sourceMappingURL=toStorable.js.map