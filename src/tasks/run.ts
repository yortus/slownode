import Types = require("event-loop");
import errors = require("../errors");
export = run;

var run = (task?: Types.Event) => {
	var self: Types.EventLoop = this;
	
	if (!task) {
		self.flushCallback = setTimeout(() => self.start(), self.pollInterval);
		return Promise.resolve(true);
	}

	var handler = self.getHandler(task.eventName, task.subscriberId);
	if (!handler) throw new Error(errors.NoHandler);

	return handler.callback(task.event)
		.then(() => self.removeTask(task))
		.then(() => true)
};