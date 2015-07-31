var Promise = require("bluebird");
var fs = require("fs");
var chai = require("chai");
var path = require("path");
var expect = chai.expect;
var unlink = Promise.promisify(fs.unlink);
var readdir = Promise.promisify(fs.readdir);
var loop;
describe("EventLoop behaviour tests", function () {
    it("will remove the previous database before starting", function (done) {
        // TODO
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
    it("will create an instance of EventLoop and create the database", function (done) {
        // TODO
    });
});
function dummyHandler(task) {
    console.log(task);
    return Promise.resolve(true);
}
function removeDatabase() {
    var push = function (arr, file) { return file.slice(-3) === ".db" ? arr.concat([file]) : arr; };
    return readdir(path.resolve("."))
        .then(function (files) { return files.reduce(push, []); })
        .then(function (files) { return Promise.all([Promise.resolve(true)].concat(files.map(toUnlink))); });
}
function toUnlink(filename) {
    return unlink(filename)
        .then(function () { return true; })
        .catch(function (err) {
        console.log(err);
        return false;
    });
}
//# sourceMappingURL=eventloop.js.map