var settings = require("../../settings");
function resolve(promiseId) {
    return settings
        .connection("promise")
        .update({ state: 1 })
        .where("id", "=", promiseId);
}
module.exports = resolve;
//# sourceMappingURL=resolve.js.map