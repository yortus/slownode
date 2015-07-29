import Types = require("event-loop");
export = stop;

var stop = () => {
	var self: Types.EventLoop = this;
	
	if (self.flushCallback) clearTimeout(self.flushCallback);
};