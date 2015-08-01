import store = require("../store/eventLoop");
import serialise = require("./serialise");
export = immediate;

function immediate(func: () => any) {
	var serialisedFunc = serialise(func);
	
	return store.add({
		arguments: "[]",
		functionId: serialisedFunc,
		runAt: Date.now(),
	});
}