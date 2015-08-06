var SlowNode = require("../src/index");
var errors = require("../src/errors");
var chai = require("chai");
var expect = chai.expect;
var loop;
describe("EventLoop behaviour tests", function () {
    it("will remove the previous database before starting", function (done) {
        SlowNode.stop()
            .then(function (result) { return expect(result).to.be.true; })
            .then(function () { return done(); })
            .catch(done);
    });
    it("will throw when provided a non-number polling delay", function () {
        var delay = "string";
        expect(start.bind(start, delay)).to.throw(errors.MustBeNumber);
    });
    it("will throw when provided <50 polling delay", function () {
        expect(start.bind(start, 49)).to.throw(errors.InvalidPollDelay);
    });
    it("will throw when provided polling delay of infinity", function () {
        expect(start.bind(start, Infinity)).to.throw(errors.NotInfinity);
    });
    it("will create an instance of EventLoop and create the database", function (done) {
        start(100)
            .then(function (worked) { return expect(true).to.equal; })
            .then(function () { return done(); })
            .catch(done);
    });
    it("will create an immediate function call with injected reference", function (done) {
        SlowNode.setImmediate(function () {
            this.chai.expect(this.h.STATUS_CODES['200']).to.equal("OK");
        }, dep("h", "http"));
        wait(done);
    });
    it("will create an immediate function call with injected value", function (done) {
        SlowNode.setImmediate(function () {
            this.chai.expect(this.injectedValue).to.equal("OK");
        }, dep("injectedValue", null, "OK"));
        wait(done);
    });
    it("will create and call a function with a delay", function (done) {
        var start = Date.now();
        SlowNode.setTimeout(function () {
            var diff = Date.now() - this.start;
            this.chai.expect(diff).to.be.above(249);
            this.chai.expect(diff).to.be.below(500);
        }, 250, dep("start", null, start));
        wait(done);
    });
    it("will create an event listener", function (done) {
        SlowNode.EventEmitter.once("test", function (arg) { console.log(arg); })
            .then(function (res) { return expect(res).to.be.equal(true); })
            .then(function () { return done(); })
            .catch(done);
    });
});
function wait(done) {
    setTimeout(function () { return done(); }, 500);
}
function start(pollIntervalMs, retryCount, retryIntervalMs) {
    retryCount = retryCount || null;
    retryIntervalMs = retryIntervalMs || null;
    return SlowNode.start({
        pollIntervalMs: pollIntervalMs,
        retryCount: retryCount,
        retryIntervalMs: retryIntervalMs
    });
}
function dep(as, reference, value) {
    var dep = {
        dependencies: [
            { as: as, },
            { reference: "mocha", as: "mocha" },
            { reference: "chai", as: "chai " }
        ]
    };
    if (reference == null)
        dep.dependencies[0].value = value;
    else
        dep.dependencies[0].reference = reference;
    return dep;
}
//# sourceMappingURL=main.js.map