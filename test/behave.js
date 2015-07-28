var fs = require("fs");
var EventLoop = require("../src/index");
var errors = require("../src/errors");
var chai = require("chai");
var expect = chai.expect;
var testname = "testdatabase";
var testDb = testname + ".db";
describe("EventLoop behaviour tests", function () {
    unlink();
    it("will throw when provided a non-string database name", function () {
        var dbName = 5;
        expect(make(dbName, 51)).to.throw(errors.InvalidDatabaseName);
    });
    it("will throw when provided an empty trying database name", function () {
        expect(make("", 1)).to.throw(errors.InvalidDatabaseName);
    });
    it("will throw when provided a non-number polling delay", function () {
        var delay = "string";
        expect(make("valid", delay)).to.throw(errors.MustBeNumber);
    });
    it("will throw when provided <50 polling delay", function () {
        expect(make("valid", 49)).to.throw(errors.InvalidPollDelay);
    });
    it("will throw when provided polling delay of infinity", function () {
        expect(make("valid", Infinity)).to.throw(errors.NotInfinity);
    });
    it("will successfully create an instance of EventLoop and create the database", function (done) {
        var loop = new EventLoop(testname, 51);
        loop.ready.then(function (success) {
            expect(success).to.equal(true);
            unlink();
            done();
        }).catch(function () { return chai.assert.fail(); });
    });
});
function make(name, delay) {
    return function () { return new EventLoop(name, delay); };
}
function unlink() {
    try {
        fs.unlinkSync(testDb);
    }
    catch (ex) {
    }
}
//# sourceMappingURL=behave.js.map