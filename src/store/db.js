var Promise = require("bluebird");
var Knex = require("knex");
var fs = require("fs");
var createSchema = require("./create");
var readFile = Promise.promisify(fs.readFile);
var writeFile = Promise.promisify(fs.writeFile);
// TODO: Database filename should be set in config
var filename = "slownode.db";
var database;
readFile("slownode.db")
    .catch(function () { return writeFile(filename); })
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
module.exports = database;
//# sourceMappingURL=db.js.map