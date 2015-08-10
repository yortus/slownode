var errors = require("../errors");
// TODO: (De)serialisation should be smarter
function serialise(func) {
    if (typeof func !== "function")
        throw new TypeError(errors.MustBeFunction);
    return "(" + func.toString() + ")";
}
module.exports = serialise;
//# sourceMappingURL=serialise.js.map