import errors = require("../errors");
export = deserialise;

// TODO: (De)serialisation should be smarter
function deserialise(func: any) {
	if (typeof func !== "string") throw new TypeError(errors.MustBeString);
	
	try {
		var parsedFunc = eval(func);
		if (typeof parsedFunc !== "function") throw new TypeError(errors.DidNotParseAsFunction);
		
		return parsedFunc;
	} catch(ex) {
		throw new Error(errors.UnableToDeserialise);
	}
	
}