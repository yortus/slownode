var Promise = require("bluebird");
var fs = require("fs");
var EventLoop = require("../src/index");
var errors = require("../src/errors");
var chai = require("chai");
var path = require("path");
var expect = chai.expect;
var unlink = Promise.promisify(fs.unlink);
var readdir = Promise.promisify(fs.readdir);
var loop;
describe("EventLoop behaviour tests", function () {
    it("will clean up", function (done) {
        unlinkAll()
            .then(function (results) {
            expect(results.every(function (r) { return r === true; })).to.equal(true);
            done();
        })
            .catch(done);
    });
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
    it("will create an instance of EventLoop and create the database", function (done) {
        var db = get("test");
        loop = new EventLoop(db.db, 51);
        loop.ready
            .then(function (isReady) { return expect(isReady).to.equal(true); })
            .then(function () { return done(); });
    });
    it("will add a task handler", function () {
        var added = loop.subscribe({
            topicFilter: "event",
            functionId: "one",
            callback: dummyHandler,
        });
        expect(added).to.equal(true);
    });
});
function dummyHandler(task) {
    console.log(task);
    return Promise.resolve(true);
}
function make(name, delay) {
    return function () { return new EventLoop(name, delay); };
}
function unlinkAll() {
    var push = function (arr, file) { return file.slice(-3) === ".db" ? arr.concat([file]) : arr; };
    return readdir(path.resolve("."))
        .then(function (files) { return files.reduce(push, []); })
        .then(function (files) { return Promise.all([Promise.resolve(true)].concat(files.map(toUnlink))); });
}
function toUnlink(filename) {
    return unlink(filename)
        .then(function () { return true; })
        .catch(function () { return false; });
}
function get(name) {
    return {
        db: name,
        file: name + ".db"
    };
}
//# sourceMappingURL=behave.js.map