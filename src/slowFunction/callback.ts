import Types = require("slownode");
import store = require("../store/index");
export = callback;

function callback(functionId: string, ...args: any[]): Promise<number> {
	var opts: Types.ISlowOptions = {
		arguments: args,
		runAt: 0
	};

	return store
		.addCall(functionId, opts)
		.then(ids => ids[0]);
}