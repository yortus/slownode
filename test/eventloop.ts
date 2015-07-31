import Promise = require("bluebird");
import fs = require("fs");
import EventLoop = require("../src/eventloop/api");
import Types = require("slownode");
import errors = require("../src/errors");
import chai = require("chai");
import path = require("path");
var expect = chai.expect;
var unlink = Promise.promisify(fs.unlink);
var readdir = Promise.promisify(fs.readdir);

var loop: Types.SlowEventLoop;
describe("EventLoop behaviour tests", () => {

	it("will remove the previous database before starting", () => {
		// TODO
	});

	it("will throw when provided a non-number polling delay", () => {
		var delay: any = "string";
		// expect().to.throw(errors.MustBeNumber);
	});

	it("will throw when provided <50 polling delay", () => {
		// expect().to.throw(errors.InvalidPollDelay);
	});

	it("will throw when provided polling delay of infinity", () => {
		// expect().to.throw(errors.NotInfinity);
	});

	it("will create an instance of EventLoop and create the database", () => {
		// TODO
	});

});

function dummyHandler(task: Types.SlowFunction) {
	console.log(task);
	return Promise.resolve(true);
}

function removeDatabase() {
	var push = (arr, file) => file.slice(-3) === ".db" ? arr.concat([file]) : arr;

	return readdir(path.resolve("."))
		.then(files => files.reduce(push, []))
		.then(files => Promise.all([Promise.resolve(true)].concat(files.map(toUnlink))))
}

function toUnlink(filename: string) {
	return unlink(filename)
		.then(() => true)
		.catch(err => {
			console.log(err);
			return false;
		});
}