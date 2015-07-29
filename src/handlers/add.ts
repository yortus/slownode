import Types = require("event-loop");
import errors = require("../errors");
export = add;

var add = (handler: Types.TaskHandler): boolean => {
	var self: Types.EventLoop = this;
	var taskHandler = self.getHandler(handler.topicFilter, handler.functionId);

	if (!!taskHandler) throw new Error(errors.FunctionExists);

	if (!self.taskHandlers[handler.topicFilter]) self.taskHandlers[handler.topicFilter] = {};
	self.taskHandlers[handler.topicFilter][handler.functionId] = handler;

	return true;
};