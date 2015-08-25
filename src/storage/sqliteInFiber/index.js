var fs = require('fs');
var path = require('path');
var await = require('asyncawait/await');
var Knex = require('knex');
var databaseLocation = require('./databaseLocation');
var serialize = require('../serialize');
var deserialize = require('../deserialize');
// TODO: all DB ops below assume there is a containing Fiber! Doc how to use this properly...
// TODO: errors are not caught... What to do?
// TODO: doc... lazy inited inside init()
var db;
var api = { init: init, add: add, get: get, set: set, del: del, find: find };
function init() {
    // Check if the database already exists. Use fs.stat since fs.exists is deprecated.
    var dbExists = true;
    try {
        fs.statSync(databaseLocation);
    }
    catch (ex) {
        dbExists = false;
    }
    // Resume the current epoch (if DB exists) or start a new epoch (if no DB).
    if (!dbExists) {
        var templateLocation = path.join(__dirname, '../empty.db');
        fs.writeFileSync(databaseLocation, fs.readFileSync(templateLocation));
    }
    // Connect to the database
    db = Knex({
        client: "sqlite3",
        connection: {
            filename: databaseLocation
        }
    });
}
function add(table, value, key) {
    var inserting = { value: serialize(value) };
    if (key)
        inserting.id = key;
    var insertedIds = await(db.table(table).insert(inserting));
    key = key || insertedIds[0];
    return key;
}
function get(table, key) {
    var rows = await(db.table(table).select('value').where('id', key));
    return rows.length === 0 ? void 0 : deserialize(rows[0].value);
}
function set(table, key, value) {
    var serializedValue = serialize(value);
    await(db.table(table).update({ value: serializedValue }).where('id', key));
}
function del(table, key) {
    await(db.table(table).delete().where('id', key));
}
// TODO: add `where` param (eg for event loop searching for what it can schedule)
function find(table) {
    var rows = await(db.table(table).select('id', 'value'));
    var results = rows.map(function (row) { return ({ id: row.id, value: deserialize(row.value) }); });
    return results;
}
module.exports = api;
//# sourceMappingURL=index.js.map