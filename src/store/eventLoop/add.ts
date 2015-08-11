import Promise = require("bluebird");
import Types = require("slownode");
import settings = require("../../settings");
export = add;

function add(functionId: string, options?: Types.ISlowOptions) {
	options = options || {};
	options.arguments = options.arguments || [];
		 
	var storable = toStorableCall(functionId, options);

	return settings.connection("eventLoop")
		.insert(storable);
}

function toStorableCall(functionId: string, options?: Types.ISlowOptions): Types.Schema.EventLoop {
	var options = options || <Types.ISlowOptions> {};
	var runAt = options.runAt || 0;
	var runAtReadable = new Date(runAt).toString();

	return {
		funcId: functionId,
		runAt: runAt,
		runAtReadable: runAtReadable,
		arguments: JSON.stringify(options.arguments)
	};
}
