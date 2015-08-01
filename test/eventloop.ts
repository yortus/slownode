import Promise = require("bluebird");
import fs = require("fs");
import SlowNode = require("../src/index");
import Types = require("slownode");
import errors = require("../src/errors");
import chai = require("chai");
var expect = chai.expect;

var loop: Types.SlowEventLoop;
describe("EventLoop behaviour tests", () => {

	it("will remove the previous database before starting", done => {
		SlowNode.exit()
			.then(result => expect(result).to.be.true)
			.then(() => done())
			.catch(done);
	});

	it("will throw when provided a non-number polling delay", () => {
		var delay: any = "string";
		// expect().to.throw(errors.MustBeNumber);
	});

	it("will throw when provided <50 polling delay", () => {
		// expect().to.throw(errors.InvalidPollDelay);
	});

	it("will throw when provided polling delay of infinity", () => {
		// expect().to.throw(errors.NotInfinity);
	});

	it("will create an instance of EventLoop and create the database", () => {
		// TODO
	});

});