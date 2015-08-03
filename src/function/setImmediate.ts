import functionStore = require("../store/function");
import Types = require("slownode");
import toStorable = require("./toStorable");
export = immediate;

function immediate(func: () => any, options?: Types.SlowFunctionOptions) {
	// TODO: Rules/logic...
	options = options || {};
	options.runAt = Date.now();
	options.intervalMs = 0;

	var slowFunction: Types.SlowFunction = {
		body: func,
		options: options
	}
	
	return functionStore.add(slowFunction);
}