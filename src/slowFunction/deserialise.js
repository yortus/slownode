var errors = require("../errors");
// TODO: (De)serialisation should be smarter
function deserialise(func) {
    var innerCall = eval(func.body);
    var dependencies = JSON.parse(func.dependencies);
    var localVariables = dependencies.map(toRequireCall);
    var parsedFunc = parseFunction(func.body);
    var outerCall = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        eval(localVariables.join(""));
        return innerCall(args);
    };
    return {
        id: func.id,
        body: outerCall.bind({}),
        options: {
            intervalMs: func.intervalMs,
            retryCount: func.retryCount,
            retryIntervalMs: func.retryIntervalMs
        }
    };
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
function toRequireCall(dependency) {
    return [
        "var",
        dependency.as,
        "=",
        "require(\"" + dependency.reference + "\");"
    ].join(" ");
}
module.exports = deserialise;
//# sourceMappingURL=deserialise.js.map