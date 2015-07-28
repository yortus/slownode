import Promise = require("bluebird");
import fs = require("fs");
import EventLoop = require("../src/index");
import errors = require("../src/errors");
import chai = require("chai");
import path = require("path");
var expect = chai.expect;
var unlink = Promise.promisify(fs.unlink);
var readdir = Promise.promisify(fs.readdir);

describe("EventLoop behaviour tests", () => {

	it("will throw when provided a non-string database name", () => {
		var dbName: any = 5;
		expect(make(dbName, 51)).to.throw(errors.InvalidDatabaseName);
	});

	it("will throw when provided an empty trying database name", () => {
		expect(make("", 1)).to.throw(errors.InvalidDatabaseName);
	});

	it("will throw when provided a non-number polling delay", () => {
		var delay: any = "string";
		expect(make("valid", delay)).to.throw(errors.MustBeNumber);
	});

	it("will throw when provided <50 polling delay", () => {
		expect(make("valid", 49)).to.throw(errors.InvalidPollDelay);
	});

	it("will throw when provided polling delay of infinity", () => {
		expect(make("valid", Infinity)).to.throw(errors.NotInfinity);
	});

	it("will successfully create an instance of EventLoop and create the database", (done) => {
		var db = get("test");
		let loop = new EventLoop(db.db, 51);
		loop.ready
			.then(expect(true).to.equal)
			.then(() => loop.stop())
			.then(() => done());
	});

	it("will clean up", done => {
		Promise.all(unlinkAll())
			.then(done)
			.catch(done);
	});

});

function make(name: string, delay: number) {
	return () => new EventLoop(name, delay);
}

function unlinkAll() {
	var push = (arr, file) => file.indexOf(".db") >= 0 ? arr.concat([file]) : arr;

	return readdir(path.resolve(".."))
		.then(files => files.reduce(push, []))
		.then(files => Promise.all(files.map(toUnlink)))
}

function toUnlink(filename: string) {
	return unlink(filename)
		.then(() => console.log("%s: Removed", filename))
		.catch(err => console.log("%s: Failed to remove: ", err));
}

function get(name: string) {
	return {
		db: name,
		file: name + ".db"
	};
}