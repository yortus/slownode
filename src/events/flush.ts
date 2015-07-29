import EventLoop = require("../index");
import Types = require("event-loop");
export = flush;

function flush() {
	var self: EventLoop = this;
	
	// TODO: Retry/failure handling
	
	return self.getNextEvent()
		.then(self.processEvent);
};