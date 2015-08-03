import store = require("../store/function");
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