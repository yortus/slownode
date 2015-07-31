var errors = require("../errors");
function validate(config) {
    if (typeof config.pollIntervalMs !== "number")
        throw new TypeError(errors.MustBeNumber);
    if (config.pollIntervalMs < 50)
        throw new Error(errors.InvalidPollDelay);
    if (config.pollIntervalMs === Infinity)
        throw new Error(errors.NotInfinity);
}
module.exports = validate;
//# sourceMappingURL=validateConfig.js.map