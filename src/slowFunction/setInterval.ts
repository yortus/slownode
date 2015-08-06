import Types = require("slownode");
import store = require("../store/index");

export = interval;

function interval(func: () => any, delayMs: number, options?: Types.SlowFunctionOptions) {
	options = options || {};
	options.runAt = Date.now();
	options.intervalMs = delayMs;

	return store.addTimedFunction({
		body: func,
		options: options
	});
}