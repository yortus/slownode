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
		wait(done);
	});

	it("will create an immediate function call with injected reference", done => {		
		SlowNode.setImmediate(function() {
			console.log(this.h.STATUS_CODES['200']);
		}, dep("h", "http"));

		wait(done);
	});
	
	it("will create an immediate function call with injected value", done => {
		SlowNode.setImmediate(function() {
			console.log(this.injectedValue);
		}, dep("injectedValue", null, "OK"));
		
		wait(done);
	});
	
	it("will create and call a function with a delay", done => {
		console.log(Date.now());
		SlowNode.setTimeout(function() {
			console.log(Date.now());
		}, 250);
		wait(done);
	});

});

function wait(done) {
	setTimeout(() => done(), 500);
}

function start(pollIntervalMs: number, retryCount?: number, retryIntervalMs?: number) {
	retryCount = retryCount || null;
	retryIntervalMs = retryIntervalMs || null;

	return SlowNode.start({
		pollIntervalMs: pollIntervalMs,
		retryCount: retryCount,
		retryIntervalMs: retryIntervalMs
	});
}

function dep(as: string, reference?: string, value?: any) {
	var dep: any = {
		dependencies: [{
			as: as,
		}]
	};
	
	if (reference == null) dep.dependencies[0].value = value;
	else dep.dependencies[0].reference = reference;

	return dep;
	
}