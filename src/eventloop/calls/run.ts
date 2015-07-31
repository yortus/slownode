import Types = require("slownode");
import errors = require("../../errors");
export = run;

function run(event?: Types.SlowFunction) {
	var self: Types.SlowEventLoop = this;
	if (!event) {
		self.flushCallback = setTimeout(() => self.start(), self.pollIntervalMs);
		return Promise.resolve(true);
	}
	
	var runPromise = Promise.resolve(true);
	
	return runPromise;
};

function execute(subscriber: Types.Subscriber, event: Types.SlowFunction) {
	//TODO: Update db according to subscriber config
	return subscriber.callback(event.arguments)
		.then(() => true)
}