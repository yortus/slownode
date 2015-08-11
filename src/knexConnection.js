var Knex = require("knex");
var databaseLocation = require('./databaseLocation');
var db = Knex({
    client: "sqlite3",
    connection: {
        filename: databaseLocation
    }
});
module.exports = db;
//# sourceMappingURL=knexConnection.js.map