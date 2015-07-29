import EventLoop = require("../index");
import Types = require("event-loop");
import errors = require("../errors");
export = add;

var add = (subscriber: Types.Subscriber): boolean => {
	var self: EventLoop = this;
	
	//TODO: Implement replacement logic
	//TODO: Persist the subscriber in the database

	if (!!self.subscribers[subscriber.id]) throw new Error(errors.FunctionExists);

	self.subscribers[subscriber.id] = subscriber;
	return true;
};