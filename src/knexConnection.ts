import Knex = require("knex");
import databaseLocation = require('./databaseLocation');
export = db;


var db = Knex({
    client: "sqlite3",
    connection: {
        filename: databaseLocation
    }
});
