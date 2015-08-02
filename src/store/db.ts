import Knex = require("knex");
export = createConnection;

function createConnection() {
	return Knex({
		client: "sqlite3",
		connection: {
			filename: "slownode.db"
		}
	});
}
// TODO: Database filename should be set in config
