var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Knex = require("knex");
var dbpath = require('../dbpath');
var dbexists = require('./dbexists');
var createSchema = require('./create');
var connect = async(function () {
    // Check if the database exists before connecting.
    var exists = await(dbexists());
    // Connect the the database. This will create the database if it doens't already exist.
    var db = Knex({
        client: "sqlite3",
        connection: {
            filename: dbpath
        }
    });
    // If the database was just created, initialise its schema now.
    if (!exists)
        await(createSchema(db));
    // Return the database connection.
    return db;
});
module.exports = connect;
//# sourceMappingURL=connect.js.map