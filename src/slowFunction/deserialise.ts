import settings = require('../settings');
import errors = require("../errors");
var log = require("ls-logger"); 
export = deserialise;


// TODO: temp testing... to make unit test pass..
import slow = require("slownode");
slow.errors;


// TODO: (De)serialisation should be smarter
function deserialise(func: slow.Schema.Function): slow.SlowFunction {
    var dependencies: Array<slow.Dependency> = JSON.parse(func.dependencies);
    
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

function wrapFunction(slowFunc: slow.SlowFunction, func: Function) {
    var deps = slowFunc.options.dependencies
        .map(dep => `this.${dep.as} = ${inject(dep)}`)
        .join("; ");
    
    eval(deps);
    
    if (settings.DEBUG) log.info(`${slowFunc.id}: executed`);
    return func.bind(this);
}

function inject(dependency: slow.Dependency) {
    return dependency.reference == null
        ? JSON.stringify(dependency.value)
        : `require("${dependency.reference}")`;

}
