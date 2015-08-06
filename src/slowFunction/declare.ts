import Types = require("slownode");
import store = require("../store/index");
export = slowFunction;

function slowFunction(id: string, callback: (...args: any[]) => any, options?: Types.ISlowOptions) {
	options = options || {};

	var slowFunc: Types.ISlowFunction = {
		id,
		body: callback,
		options
	};
	
	// TODO: Option validation..
	return store.addFunction(slowFunc)
		.then(() => id);

}