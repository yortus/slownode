import Types = require("slownode");
import errors = require("../errors");
export = deserialise;

// TODO: (De)serialisation should be smarter
function deserialise(func: Types.Schema.Function): Types.SlowFunction {
	var dependencies: Array<Types.Dependency> = JSON.parse(func.dependencies);
	
	var output = {
		id: func.id,
		body: null,
		options: { 
			dependencies: dependencies,
			intervalMs: func.intervalMs,
			retryCount: func.retryCount,
			retryIntervalMs: func.retryIntervalMs
		}
	}
	
	var innerCall = parseFunction(func.body);
	var wrappedCall = wrapFunction.call({}, output, innerCall);
	output.body = wrappedCall;
	
	return output;
}

function parseFunction(body: string): (...args: any[]) => any {
	try {
		var parsedFunc = eval(body);
		if (typeof parsedFunc !== "function") throw new TypeError(errors.DidNotParseAsFunction);

		return parsedFunc;
	} catch (ex) {
		throw new Error(errors.UnableToDeserialise);
	}
}

function wrapFunction(slowFunc: Types.SlowFunction, func: Function) {
	var deps = slowFunc.options.dependencies
		.map(dep => `this.${dep.as} = ${inject(dep)}`)
		.join("; ");

	eval(deps);
	return func.bind(this);
}

function inject(dependency: Types.Dependency) {
	return dependency.reference == null
		? JSON.stringify(dependency.value)
		: `require("${dependency.reference}")`;

}