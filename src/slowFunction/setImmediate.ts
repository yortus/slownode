import store = require("../store/index");
import Types = require("slownode");
export = immediate;

function immediate(func: () => any, options?: Types.SlowFunctionOptions) {
	options = options || {};
	options.runAt = 0;
	options.intervalMs = 0;
	
	return store.addFunction({
		body: func,
		options: options
	});
}