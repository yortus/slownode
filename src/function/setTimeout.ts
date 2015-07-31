import store = require("../store/eventLoop");
import serialise = require("./serialise");
export = timeout;

function timeout(func: () => Promise<any>, delayMs: number) {
	var serialisedFunc = serialise(func);
	
	return store.add({
		arguments: "[]",
		functionId: serialisedFunc,
		runAt: Date.now() + delayMs,
	});
}