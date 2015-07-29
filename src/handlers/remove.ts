import Types = require("event-loop");
import errors = require("../errors");
export = remove;

var remove = (topicFilter: string, functionId: string): boolean => {
	var self: Types.EventLoop = this;
	var topicTasks = self.taskHandlers[topicFilter] || {};

	var isExisting = !!topicTasks[functionId];
	if (!isExisting) return false;

	return delete self.taskHandlers[topicFilter][functionId];
};