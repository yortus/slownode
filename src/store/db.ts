import Promise = require("bluebird");
import Knex = require("knex");
import fs = require("fs");
export = database;

// TODO: Database filename should be set in config
var database = Knex({
	client: "sqlite3",
	connection: {
		filename: "slownode.db" 
	}
});