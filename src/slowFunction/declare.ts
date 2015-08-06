import Types = require("slownode");
import store = require("../store/index");
export = slowFunction;

function slowFunction(id: string, callback: (...args: any[]) => any, options?: Types.SlowFunctionOptions) {
	options = options || {};

	var slowFunc: Types.SlowFunction = {
		id,
		body: callback,
		options
	};
	
	// TODO: Option validation..
	return store.addFunction(slowFunc)
		.then(() => id);

}