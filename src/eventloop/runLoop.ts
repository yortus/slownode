import SlowNode = require("../index");
import EventLoop = require("./index");
export = runLoop;

function runLoop() {
	// TODO: Retry/failure handling

	EventLoop
		.getNext()
		.then(EventLoop.exec)
};