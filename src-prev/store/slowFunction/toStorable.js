var crypto = require("crypto");
var serialise = require("../../slowFunction/serialise");
function toStorable(slowFunction) {
    var options = slowFunction.options || {};
    var body = serialise(slowFunction.body);
    var id = slowFunction.id || generateFunctionId(body);
    var dependencies = JSON.stringify(options.dependencies || []);
    return {
        id: id,
        body: body,
        dependencies: dependencies,
        intervalMs: options.intervalMs || 0,
        retryCount: options.retryCount || 0,
        retryIntervalMs: options.retryIntervalMs || 0
    };
}
function generateFunctionId(body) {
    return crypto.createHash("md5")
        .update(body)
        .digest("hex");
}
module.exports = toStorable;
//# sourceMappingURL=toStorable.js.map