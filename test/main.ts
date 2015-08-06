import Promise = require("bluebird");
import fs = require("fs");
import SlowNode = require("../src/index");
import Types = require("slownode");
import errors = require("../src/errors");
import chai = require("chai");
var expect = chai.expect;

SlowNode.DEBUG = true;
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
			.then(result => expect(true).to.equal(result))
			.then(() => done())
			.catch(done);
	});

	it("will have SlowNode implicitly available in a SlowFunction", done => {
		SlowNode.setImmediate(function() {
			this.chai.expect(SlowNode).to.exist;
		}, dep());
		wait(done);
	})

	it("will create an immediate function call with injected reference", done => {
		SlowNode.setImmediate(function() {
			this.chai.expect(this.h.STATUS_CODES['200']).to.equal("OK");
		}, dep("h", "http"));

		wait(done);
	});

	it("will create an immediate function call with injected value", done => {
		SlowNode.setImmediate(function() {
			this.chai.expect(this.injectedValue).to.equal("OK");
		}, dep("injectedValue", null, "OK"));

		wait(done);
	});

	it("will create and call a function with a delay", done => {
		var start = Date.now()
		SlowNode.setTimeout(function() {
			var diff = Date.now() - this.start;
			this.chai.expect(diff).to.be.above(249);
			this.chai.expect(diff).to.be.below(500);
		}, 250, dep("start", null, start));

		wait(done);
	});

	it("will create an event listener then emit an event with an argument", done => {
		var func = function(arg) {
			this.chai.expect(arg).to.equal("argument");
		}

		SlowNode.EventEmitter.once("test", func, dep())
			.then(res => expect(res).to.be.equal(true))
			.then(() => SlowNode.EventEmitter.emit("test", "argument"));

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

function dep(as?: string, reference?: string, value?: any) {
	var dep: any = {
		dependencies: [
			{ reference: "mocha", as: "mocha" },
			{ reference: "chai", as: "chai " }
		]
	};

	if (!as) return dep;

	if (reference == null) dep.dependencies.push({ as: as, value: value });
	else dep.dependencies.push({ as: as, reference: reference });

	return dep;

}