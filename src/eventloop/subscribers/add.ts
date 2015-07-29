import EventLoop = require("../api");
import Types = require("slownode");
import errors = require("../../errors");
export = add;

function add(subscriber: Types.Subscriber): boolean {
	var self: EventLoop = this;
	
	//TODO: Implement replacement logic
	//TODO: Persist the subscriber in the database

	if (!!self.subscribers[subscriber.id]) throw new Error(errors.FunctionExists);

	self.subscribers[subscriber.id] = subscriber;
	return true;
};