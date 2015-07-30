import store = require("../store/eventLoop");
import serialise = require("./serialise");
export = immediate;

function immediate(func: () => Promise<any>) {
	var serialisedFunc = serialise(func);
	
	return store.add({
		arguments: "[]",
		functionId: serialisedFunc,
		runAt: Date.now(),
	});
}