import Types = require("event-loop");
import errors = require("../errors");
export = add;

var add = (handler: Types.Subscriber): boolean => {
	var self: Types.EventLoop = this;
	var taskHandler = self.getHandler(handler.topicFilter, handler.functionId);

	if (!!taskHandler) throw new Error(errors.FunctionExists);

	if (!self.subscribers[handler.topicFilter]) self.subscribers[handler.topicFilter] = {};
	self.subscribers[handler.topicFilter][handler.functionId] = handler;

	return true;
};