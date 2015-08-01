var SlowNode = require("../src/index");
var chai = require("chai");
var expect = chai.expect;
var loop;
describe("EventLoop behaviour tests", function () {
    it("will remove the previous database before starting", function (done) {
        SlowNode.exit()
            .then(function (result) { return expect(result).to.be.true; })
            .then(done)
            .catch(done);
    });
    it("will throw when provided a non-number polling delay", function () {
        var delay = "string";
        // expect().to.throw(errors.MustBeNumber);
    });
    it("will throw when provided <50 polling delay", function () {
        // expect().to.throw(errors.InvalidPollDelay);
    });
    it("will throw when provided polling delay of infinity", function () {
        // expect().to.throw(errors.NotInfinity);
    });
    it("will create an instance of EventLoop and create the database", function () {
        // TODO
    });
});
//# sourceMappingURL=eventloop.js.map