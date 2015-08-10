import fs = require("fs");
import Promise = require("bluebird");
import SlowNode = require("slownode");
import chai = require("chai");
var expect = chai.expect;


SlowNode.DEBUG = true;


describe("EventLoop behaviour tests", () => {

	it("will remove the previous database before starting", done => {
		SlowNode.stop()
			.then(result => expect(result).to.be.true)
			.then(() => done())
			.catch(done);
	});

	it("will throw when provided a non-number polling delay", () => {
		var delay: any = "string";
		expect(start.bind(start, delay)).to.throw(SlowNode.errors.MustBeNumber);
	});

	it("will throw when provided <50 polling delay", () => {
		expect(start.bind(start, 49)).to.throw(SlowNode.errors.InvalidPollDelay);
	});

	it("will throw when provided polling delay of infinity", () => {
		expect(start.bind(start, Infinity)).to.throw(SlowNode.errors.NotInfinity);
	});

	it("will create an instance of EventLoop and create the database", done => {
		start(50)
			.then(result => expect(true).to.equal(result))
			.then(() => done())
			.catch(done);
	});

	it("will have SlowNode implicitly available in a SlowFunction", done => {
		SlowNode.setImmediate(function() {
			this.chai.expect(SlowNode).to.exist;
		}, dep())
			.delay(150).then(() => done())
			.catch(done);
	})

	it("will create an immediate function call with injected reference", done => {
		SlowNode.setImmediate(function() {
			this.chai.expect(this.h.STATUS_CODES['200']).to.equal("OK");
		}, dep("h", "http"))
			.delay(150).then(() => done())
			.catch(done);
	});

	it("will create an immediate function call with injected value", done => {
		SlowNode.setImmediate(function() {
			this.chai.expect(this.injectedValue).to.equal("OK");
		}, dep("injectedValue", null, "OK"))
			.delay(150).then(() => done())
			.catch(done);
	});

	it("will create and call a function with a delay", done => {
		var start = Date.now()
		
		SlowNode.setTimeout(function() {
			var diff = Date.now() - this.start;
			this.chai.expect(diff).to.be.above(249);
			this.chai.expect(diff).to.be.below(500);
		}, 250, dep("start", null, start))
			.delay(150).then(() => done())
			.catch(done);

	});

	it("will create an event listener then emit an event with an argument", done => {
		var func = function(arg) {
			this.chai.expect(arg).to.equal("argument");
		}

		SlowNode.EventEmitter.once("test", func, dep())
			.then(res => expect(res).to.be.equal(true))
			.then(() => SlowNode.EventEmitter.emit("test", "argument"))
			.delay(150).then(() => done())
			.catch(done);

	});

	it("will create a named SlowFunction", done => {
		SlowNode.SlowFunction("testFunction", function(args) {
			return args;
		}, dep())
			.then(id => expect(id).to.equal("testFunction"))
			.then(() => done())
			.catch(done);
	});

	it("will callback a named function with arguments", done => {
		SlowNode.Callback("testFunction", "test callback")
			.then(val => expect(val).to.be.equal("test callback"))
			.then(() => done())
			.catch(done);
	});

	it("will created a named SlowFunction that takes 2 arguments", done => {
		SlowNode.SlowFunction("secondFunction", function(left, right) {
			return left + right;
		}, dep())
			.then(id => expect(id).to.equal("secondFunction"))
			.then(() => done())
			.catch(done);
	});

	it("will callback a named function with 2 arguments", done => {
		SlowNode.Callback("secondFunction", 3, 7)
			.then(val => expect(val).to.equal(10))
			.delay(150).then(() => done())
			.catch(done);
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

function dep(as?: string, reference?: string, value?: any) {
	var dep: any = {
		dependencies: [{ reference: "chai", as: "chai " }]
	};

	if (!as) return dep;

	if (reference == null) dep.dependencies.push({ as: as, value: value });
	else dep.dependencies.push({ as: as, reference: reference });

	return dep;

}