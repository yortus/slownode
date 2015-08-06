import store = require("../store/index");
import Types = require("slownode");
export = immediate;

function immediate(func: () => any, options?: Types.ISlowOptions) {
	options = options || {};
	options.runAt = 0;
	options.intervalMs = 0;

	return store
		.addTimedFunction({
			body: func,
			options: options
		});
}