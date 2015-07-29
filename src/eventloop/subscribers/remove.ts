import EventLoop = require("../api");
import Types = require("slownode");
import errors = require("../../errors");
export = remove;

// TODO: Persist subscriber changes
function remove(subscriberId: string): boolean {
	var self: EventLoop = this;
	var subscriber = self.subscribers[subscriberId] || {};

	var isExisting = !!subscriber;
	if (!isExisting) return false;

	return delete self.subscribers[subscriber];
};