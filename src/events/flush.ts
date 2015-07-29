import Types = require("event-loop");
export = flush;

var flush = () => {
	var self: Types.EventLoop = this;
	self.getNextTask()
		.then(self.runTask)

	return true;
};