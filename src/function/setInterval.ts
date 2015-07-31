import store = require("../store/eventLoop");
import serialise = require("./serialise");
export = interval;

function interval(func: () => Promise<any>, delayMs: number) {
	var serialisedFunc = serialise(func);
	
	return store.add({
		arguments: "[]",
		functionId: serialisedFunc,
		repeat: 1,
		runAt: Date.now() + delayMs,
	});
}