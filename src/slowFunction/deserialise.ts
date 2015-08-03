import Types = require("slownode");
import errors = require("../errors");
export = deserialise;

// TODO: (De)serialisation should be smarter
function deserialise(func: Types.Schema.Function): Types.SlowFunction {

	var innerCall = eval(func.body);
	var dependencies: Array<Types.Dependency> = JSON.parse(func.dependencies);

	var localVariables = dependencies.map(toRequireCall);
	var parsedFunc = parseFunction(func.body);

	var outerCall = (...args: any[]) => {
		for (var key in localVariables)
			eval(localVariables[key]);

		return innerCall(args)
	}
	
	return {
		id: func.id,
		body: outerCall,
		options: {
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


function toRequireCall(dependency: Types.Dependency) {
	return [
		"var",
		dependency.as,
		"=",
		"require('",
		dependency.reference,
		"');"
	].join(" ");
}

