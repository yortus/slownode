var errors = require("../errors");
// TODO: (De)serialisation should be smarter
function deserialise(func) {
    if (typeof func !== "string")
        throw new TypeError(errors.MustBeString);
    try {
        var parsedFunc = eval(func);
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