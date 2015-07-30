import Types = require("slownode");
import errors = require("../../errors");
export = run;

function run(event?: Types.Event) {
	var self: Types.SlowEventLoop = this;
	if (!event) {
		self.flushCallback = setTimeout(() => self.start(), self.config.pollIntervalMs);
		return Promise.resolve(true);
	}
	
	var runPromise = Promise.resolve(true);
	
	return runPromise;
};

function execute(subscriber: Types.Subscriber, event: Types.Event) {
	//TODO: Update db according to subscriber config
	return subscriber.callback(event.event)
		.then(() => true)
}