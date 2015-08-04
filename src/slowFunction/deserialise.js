var errors = require("../errors");
// TODO: (De)serialisation should be smarter
function deserialise(func) {
    var dependencies = JSON.parse(func.dependencies);
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
module.exports = deserialise;
//# sourceMappingURL=deserialise.js.map