import EventLoop = require("../index");
import Types = require("event-loop");
export = stop;

function stop() {
	var self: EventLoop = this;
	
	if (self.flushCallback) clearTimeout(self.flushCallback);
};