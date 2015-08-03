import Types = require("slownode");
import errors = require("../../errors");
import * as self from "../../index";
export = run;

function run(event?: Types.SlowFunction) {

	if (!event) {
		self.flushCallback = setTimeout(() => self.flush(), self.configuration.pollIntervalMs);
		return Promise.resolve(true);
	}
	
	var runPromise = Promise.resolve(true);
	
	return runPromise;
};