var settings = require("../../settings");
function reject(promiseId) {
    return settings
        .connection("promise")
        .update({ state: 2 })
        .where("id", "=", promiseId);
}
module.exports = reject;
//# sourceMappingURL=reject.js.map