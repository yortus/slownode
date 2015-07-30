import Types = require("slownode");
export = flush;

function flush() {
	var self: Types.SlowEventLoop = this;
	
	// TODO: Retry/failure handling
	
	return self.getNextCall()
		.then(self.processCall);
};