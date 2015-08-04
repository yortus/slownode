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
		SlowNode.stop()
			.then(result => expect(result).to.be.true)
			.then(() => done())
			.catch(done);
	});

	it("will throw when provided a non-number polling delay", () => {
		var delay: any = "string";
		expect(start.bind(start, delay)).to.throw(errors.MustBeNumber);
	});

	it("will throw when provided <50 polling delay", () => {
		expect(start.bind(start, 49)).to.throw(errors.InvalidPollDelay);
	});

	it("will throw when provided polling delay of infinity", () => {
		expect(start.bind(start, Infinity)).to.throw(errors.NotInfinity);
	});

	it("will create an instance of EventLoop and create the database", done => {
		start(100)
			.then(worked => expect(true).to.equal)
			.then(() => done())
			.catch(done);
	});
	
	it("will create an immediate function call", done => {
		SlowNode.setImmediate(() => console.log("test"));
		setTimeout(() => done(), 500);
	});
	
	it("will create an immediate function call with dependencies", done => {
		SlowNode.setImmediate(function() {
			var hash = this.cry.createHash("md5")
				.update("test")
				.digest("hex");
				
			console.log(hash);
		}, {
			dependencies: [{
				reference: "crypto",
				as: "cry"
			}]
		});
		
		setTimeout(() => done(), 500);
	});

});

function start(pollIntervalMs: number, retryCount?: number, retryIntervalMs?: number) {
	retryCount = retryCount || null;
	retryIntervalMs = retryIntervalMs || null;
	
	return SlowNode.start({
		pollIntervalMs: pollIntervalMs,
		retryCount: retryCount,
		retryIntervalMs: retryIntervalMs
	});
}