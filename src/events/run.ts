import EventLoop = require("../index");
import Types = require("event-loop");
import errors = require("../errors");
export = run;

var run = (event?: Types.Event) => {
	var self: EventLoop = this;

	if (!event) {
		self.flushCallback = setTimeout(() => self.start(), self.pollInterval);
		return Promise.resolve(true);
	}
	
	var runPromise = Promise.resolve(true);
	
	self.subscribers.forEach(sub => {
		runPromise.then(() => execute(sub, event));
	});
	
	return runPromise;
};

function execute(subscriber: Types.Subscriber, event: Types.Event) {
	//TODO: Update db according to subscriber config
	return subscriber.callback(event.event)
		.then(() => true)
}