import store = require("../store/slowFunction");
import Types = require("slownode");
import toStorable = require("./toStorable");
export = immediate;

function immediate(func: () => any, options?: Types.SlowFunctionOptions) {
	options = options || {};
	options.runAt = Date.now();
	options.intervalMs = 0;

	return store.add({
		body: func,
		options: options
	});
}