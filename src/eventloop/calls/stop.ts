import SlowNode = require("slownode");
import Types = require("slownode");
export = stop;

function stop() {
	var self: SlowNode.SlowEventLoop = this;
	
	if (self.flushCallback) clearTimeout(self.flushCallback);
};