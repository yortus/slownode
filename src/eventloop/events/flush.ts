import EventLoop = require("../api");
import Types = require("slownode");
export = flush;

function flush() {
	var self: EventLoop = this;
	
	// TODO: Retry/failure handling
	
	return self.getNextEvent()
		.then(self.processEvent);
};