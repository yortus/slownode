import Types = require("slownode");
import errors = require("../errors");
export = deserialise;

// TODO: (De)serialisation should be smarter
function deserialise(func: Types.Schema.Function): Types.SlowFunction {

	var dependencies: Array<Types.Dependency> = JSON.parse(func.dependencies);
	var innerCall = parseFunction(func.body);
	
	return {
		id: func.id,
		body: innerCall,
		options: { 
			dependencies: dependencies,
			intervalMs: func.intervalMs,
			retryCount: func.retryCount,
			retryIntervalMs: func.retryIntervalMs
		}
	}
}

function parseFunction(body: string) {
	try {
		var parsedFunc = eval(body);
		if (typeof parsedFunc !== "function") throw new TypeError(errors.DidNotParseAsFunction);

		return parsedFunc;
	} catch (ex) {
		throw new Error(errors.UnableToDeserialise);
	}
}