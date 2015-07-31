import SlowNode = require("slownode");
import errors = require("./errors");
export = validate

function validate(config: SlowNode.Config) {
	if (typeof config.pollIntervalMs !== "number") throw new TypeError(errors.MustBeNumber);
	if (config.pollIntervalMs < 50) throw new Error(errors.InvalidPollDelay);
	if (config.pollIntervalMs === Infinity) throw new Error(errors.NotInfinity);
	
	return true;
}