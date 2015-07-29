import Types = require("event-loop");
import errors = require("../errors");
export = run;

var run = (task?: Types.EventTask) => {
	var self: Types.EventLoop = this;
	
	if (!task) {
		self.flushCallback = setTimeout(() => self.flushTask(), self.pollingDelay);
		return Promise.resolve(true);
	}

	var handler = self.getHandler(task.topicFilter, task.functionId);
	if (!handler) throw new Error(errors.NoHandler);

	return handler.callback(task.task)
		.then(() => self.removeTask(task))
		.then(() => true)
};