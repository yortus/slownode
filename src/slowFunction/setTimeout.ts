import Types = require("slownode");
import store = require("../store/index");
export = timeout;

function timeout(func: () => any, delayMs: number, options?: Types.SlowFunctionOptions) {
	options = options || {};
	options.intervalMs = 0;
	options.runAt = Date.now() + delayMs;
	
	return store.addFunction({
		body: func,
		options: options
	});
}