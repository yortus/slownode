var SlowNode = require("../src/index");
var errors = require("../src/errors");
var chai = require("chai");
var crypto = require("crypto");
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
    it("will create an immediate function call", function (done) {
        SlowNode.setImmediate(function () { return console.log("test"); });
        setTimeout(function () { return done(); }, 500);
    });
    it("will create an immediate function call with dependencies", function (done) {
        SlowNode.setImmediate(function () {
            var hash = crypto.createHash("md5")
                .update("test")
                .digest("hex");
            console.log(hash);
        }, {
            dependencies: [{
                    reference: "crypto",
                    as: "crypto"
                }]
        });
        setTimeout(function () { return done(); }, 500);
    });
});
function start(pollIntervalMs, retryCount, retryIntervalMs) {
    retryCount = retryCount || null;
    retryIntervalMs = retryIntervalMs || null;
    return SlowNode.start({
        pollIntervalMs: pollIntervalMs,
        retryCount: retryCount,
        retryIntervalMs: retryIntervalMs
    });
}
//# sourceMappingURL=eventloop.js.map