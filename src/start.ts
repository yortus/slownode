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
	
	count = 3;
	return prepareDatabase();
}

var count = 0;
function prepareDatabase() {
	if (count <= 0) throw new Error(errors.DatabaseInitFailed);
	count--;
	
	return Promise
		.delay(150)
		.then(() => readFile("slownode.db"))
		.catch(createBlankDatabase)
		.then(createSchema)
		.then(() => true)
		.catch(err => {
			console.log(err);
			return prepareDatabase();
		});
}

function createBlankDatabase(fileContent: any) {
	if (!!fileContent) return Promise.resolve(true);
	console.log("Create it!");
	return new Promise((resolve, reject) => {
		fs.writeFile("slownode.db", "", err => {
			if (!err) return resolve(<any>true);
			reject(err);
		});
	});
	
}