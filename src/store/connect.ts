import async = require('asyncawait/async');
import await = require('asyncawait/await');
import Knex = require("knex");
import dbpath = require('../dbpath');
import dbexists = require('./dbexists');
import createSchema = require('./create');
export = connect;


var connect = async(() => {

    // Check if the database exists before connecting.
    var exists = await(dbexists());

    // Connect the the database. This will create the database if if doens't already exist.
    var db = Knex({
        client: "sqlite3",
        connection: {
            filename: dbpath
        }
    });

    // If the database was just created, initialise its schema now.
    if (!exists) await(createSchema(db));

    // Return the database connection.
    return db;
});
