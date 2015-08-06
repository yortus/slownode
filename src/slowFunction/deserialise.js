var SlowNode = require("../index");
var errors = require("../errors");
var log = require("ls-logger");
SlowNode;
// TODO: (De)serialisation should be smarter
function deserialise(func) {
    var dependencies = JSON.parse(func.dependencies);
    var output = {
        id: func.id,
        body: null,
        options: {
            dependencies: dependencies,
            intervalMs: func.intervalMs,
            retryCount: func.retryCount,
            retryIntervalMs: func.retryIntervalMs
        }
    };
    var innerCall = parseFunction(func.body);
    var wrappedCall = wrapFunction.call({}, output, innerCall);
    output.body = wrappedCall;
    return output;
}
function parseFunction(body) {
    try {
        var parsedFunc = eval(body);
        if (typeof parsedFunc !== "function")
            throw new TypeError(errors.DidNotParseAsFunction);
        return parsedFunc;
    }
    catch (ex) {
        throw new Error(errors.UnableToDeserialise);
    }
}
function wrapFunction(slowFunc, func) {
    var deps = slowFunc.options.dependencies
        .map(function (dep) { return ("this." + dep.as + " = " + inject(dep)); })
        .join("; ");
    eval(deps);
    if (SlowNode.DEBUG)
        log.info(slowFunc.id + ": Function executed");
    return func.bind(this);
}
function inject(dependency) {
    return dependency.reference == null
        ? JSON.stringify(dependency.value)
        : "require(\"" + dependency.reference + "\")";
}
module.exports = deserialise;
//# sourceMappingURL=deserialise.js.map