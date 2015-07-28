import Promise = require("bluebird");
import fs = require("fs");
import EventLoop = require("../src/index");
import errors = require("../src/errors");
import chai = require("chai");
var expect = chai.expect;

var testname = "testdatabase";
var testDb = testname + ".db";

describe("EventLoop behaviour tests", () => {

	unlink();

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
		let loop = new EventLoop(testname, 51);
		loop.ready.then(success => {
			expect(success).to.equal(true);
			unlink();
			done();
		}).catch(() => chai.assert.fail());
	});
});

function make(name: string, delay: number) {
	return () => new EventLoop(name, delay);
}

function unlink() {
	try {
		fs.unlinkSync(testDb);
	} catch (ex) {
	}
}