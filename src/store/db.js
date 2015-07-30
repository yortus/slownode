var Knex = require("knex");
// TODO: Database filename should be set in config
var database = Knex({
    client: "sqlite3",
    connection: {
        filename: "slownode.db"
    }
});
module.exports = database;
//# sourceMappingURL=db.js.map