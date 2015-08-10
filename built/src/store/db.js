var Knex = require("knex");
var dbpath = require('../dbpath');
var db = Knex({
    client: "sqlite3",
    connection: {
        filename: dbpath
    }
});
module.exports = db;
//# sourceMappingURL=db.js.map