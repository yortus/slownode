import Knex = require("knex");
export = database;

// TODO: Database filename should be set in config
var database = Knex({
	client: "sqlite3",
	connection: {
		filename: "slownode.db"
	}
});