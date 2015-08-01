import SlowNode = require("slownode");
import Promise = require("bluebird");
import Knex = require("knex");
import fs = require("fs");
import db = require("./store/db");
import validateConfig = require("./validateConfig");
import errors = require("./errors");
import createSchema = require("./store/create");
var readFile = Promise.promisify(fs.readFile);
export = start;

function start(config: SlowNode.Config) {
	var self: SlowNode.SlowNodeStatic = this;
	// TODO: More?
	validateConfig(config);
	self.configuration = config;
	
	return prepareDatabase();
}

var count = 3;
function prepareDatabase() {
	if (count === 0) throw new Error(errors.DatabaseInitFailed);
	count--;
	
	return Promise
		.delay(100)
		.then(() => readFile("slownode.db"))
		.then(createSchema)
		.then(() => true)
		.catch(prepareDatabase);
}