import Knex = require("knex");
import dbpath = require('../dbpath');
export = db;


var db = Knex({
	client: "sqlite3",
	connection: {
		filename: dbpath
	}
});
