import EventLoop = require("../api");
import Types = require("slownode");
export = stop;

function stop() {
	var self: EventLoop = this;
	
	if (self.flushCallback) clearTimeout(self.flushCallback);
};