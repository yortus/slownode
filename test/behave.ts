import EventLoop = require("../src/index");
import errors = require("../src/errors");
import chai = require("chai");
var expect = chai.expect;

describe("EventLoop behaviour tests", () => {
	
	it("will throw when provided a non-string database name", () => {
		var dbName: any = 5;
		expect(() => new EventLoop(dbName, 1)).to.throw(errors.InvalidDatabaseName);
	});
	
	it("will throw when provided an empty trying database name", () => {
		expect(() => new EventLoop("", 1)).to.throw(errors.InvalidDatabaseName);
	});
	
	it("will throw when provided a non-number polling delay", () => {
		var delay: any = "string";
		expect(() => new EventLoop("valid", delay)).to.throw(errors.MustBeNumber);
	});
	
	it("will throw when provided <50 polling delay", () => {
		expect(() => new EventLoop("valid", 49)).to.throw(errors.InvalidPollDelay);
	});
	
	it("will throw when provided polling delay of infinity", () => {
		expect(() => new EventLoop("valid", Infinity)).to.throw(errors.NotInfinity);
	});
	
	
});