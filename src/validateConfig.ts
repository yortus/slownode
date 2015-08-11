import Types = require("slownode");
import errors = require("./errors");
export = validate

function validate(config: Types.SlowConfig) {
    if (typeof config.pollIntervalMs !== "number") throw new TypeError(errors.MustBeNumber);
    if (config.pollIntervalMs < 50) throw new Error(errors.InvalidPollDelay);
    if (config.pollIntervalMs === Infinity) throw new Error(errors.NotInfinity);
    
    return true;
}
