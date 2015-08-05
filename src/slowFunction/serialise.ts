import errors = require("../errors");
export = serialise;

// TODO: (De)serialisation should be smarter
function serialise(func: (args?: Object) => any) {
	if (typeof func !== "function") throw new TypeError(errors.MustBeFunction);
	
	return "(" + func.toString() + ")";
}