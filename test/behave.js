var EventLoop = require("../src/index");
var errors = require("../src/errors");
var chai = require("chai");
var expect = chai.expect;
describe("EventLoop behaviour tests", function () {
    it("will throw when provided a non-string database name", function () {
        var dbName = 5;
        expect(function () { return new EventLoop(dbName, 1); }).to.throw(errors.InvalidDatabaseName);
    });
    it("will throw when provided an empty trying database name", function () {
        expect(function () { return new EventLoop("", 1); }).to.throw(errors.InvalidDatabaseName);
    });
    it("will throw when provided a non-number polling delay", function () {
        var delay = "string";
        expect(function () { return new EventLoop("valid", delay); }).to.throw(errors.MustBeNumber);
    });
    it("will throw when provided <50 polling delay", function () {
        expect(function () { return new EventLoop("valid", 49); }).to.throw(errors.InvalidPollDelay);
    });
    it("will throw when provided polling delay of infinity", function () {
        expect(function () { return new EventLoop("valid", Infinity); }).to.throw(errors.NotInfinity);
    });
});
//# sourceMappingURL=behave.js.map