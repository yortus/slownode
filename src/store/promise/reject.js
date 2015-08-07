var SlowNode = require("../../index");
function reject(promiseId) {
    return SlowNode
        .connection("promise")
        .update({ state: 2 })
        .where("id", "=", promiseId);
}
module.exports = reject;
//# sourceMappingURL=reject.js.map