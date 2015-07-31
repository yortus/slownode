import Promise = require("bluebird");
import Knex = require("knex");
import fs = require("fs");
import createSchema = require("./create");
var readFile = Promise.promisify(fs.readFile);
var writeFile = Promise.promisify(fs.writeFile);
export = database;

// TODO: Database filename should be set in config
var filename = "slownode.db";
var database: Knex;

readFile("slownode.db")
	.catch(() => writeFile(filename))
	.then(createConnection)
	.then(createSchema);


function createConnection() {
	database = Knex({
		client: "sqlite3",
		connection: {
			filename: filename
		}
	});
	return database;
}