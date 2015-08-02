var Knex = require("knex");
function createConnection() {
    return Knex({
        client: "sqlite3",
        connection: {
            filename: "slownode.db"
        }
    });
}
module.exports = createConnection;
// TODO: Database filename should be set in config
//# sourceMappingURL=db.js.map