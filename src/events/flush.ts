import EventLoop = require("../index");
import Types = require("event-loop");
export = flush;

var flush = () => {
	var self: EventLoop = this;
	
	return self.getNextEvent()
		.then(self.processEvent);
};