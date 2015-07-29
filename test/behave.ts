import Promise = require("bluebird");
import fs = require("fs");
import EventLoop = require("../src/index");
import Types = require("event-loop");
import errors = require("../src/errors");
import chai = require("chai");
import path = require("path");
var expect = chai.expect;
var unlink = Promise.promisify(fs.unlink);
var readdir = Promise.promisify(fs.readdir);

var loop: EventLoop;
describe("EventLoop behaviour tests", () => {

	

	it("will clean up", done => {
		unlinkAll()
			.then(results => {
				expect(results.every(r => r === true)).to.equal(true);
				done();
			})
			.catch(done);
	});

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

	it("will create an instance of EventLoop and create the database", (done) => {
		var db = get("test");
		loop = new EventLoop(db.db, 51);
		loop.ready
			.then(isReady => expect(isReady).to.equal(true))
			.then(() => done());
	});

	it("will add a task handler", () => {
		var added = loop.subscribe({
			topicFilter: "event",
			functionId: "one",
			callback: dummyHandler,
		});
		
		expect(added).to.equal(true);
	});

});

function dummyHandler(task: Types.Event) {
	console.log(task);
	return Promise.resolve(true);
}

function make(name: string, delay: number) {
	return () => new EventLoop(name, delay);
}

function unlinkAll() {
	var push = (arr, file) => file.slice(-3) === ".db" ? arr.concat([file]) : arr;

	return readdir(path.resolve("."))
		.then(files => files.reduce(push, []))
		.then(files => Promise.all([Promise.resolve(true)].concat(files.map(toUnlink))))
}

function toUnlink(filename: string) {
	return unlink(filename)
		.then(() => true)
		.catch(() => false);
}

function get(name: string) {
	return {
		db: name,
		file: name + ".db"
	};
}