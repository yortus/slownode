var SlowNode = require("../../index");
function resolve(promiseId) {
    return SlowNode
        .connection("promise")
        .update({ state: 1 })
        .where("id", "=", promiseId);
}
module.exports = resolve;
//# sourceMappingURL=resolve.js.map