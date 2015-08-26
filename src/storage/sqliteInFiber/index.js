var fs = require('fs');
var path = require('path');
var await = require('asyncawait/await');
var Knex = require('knex');
var databaseLocation = require('./databaseLocation');
var deserialize = require('../deserialize');
// TODO: all DB ops below assume there is a containing Fiber! Doc how to use this properly...
// TODO: errors are not caught... What to do?
// TODO: doc... lazy inited inside init()
var db;
var api = { init: init, insert: insert, upsert: upsert, update: update, remove: remove, find: find };
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
        var templateLocation = path.join(__dirname, 'emptyTemplate.db');
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
function insert(record) {
    // TODO: ...
    throw 'Not implemented';
    return null;
}
function upsert(record) {
    // TODO: ...
    throw 'Not implemented';
    return null;
}
function update(record) {
    // TODO: ...
    throw 'Not implemented';
    return null;
}
function remove(record) {
    // TODO: ...
    throw 'Not implemented';
    return null;
}
//function add(table: string, value: any, key?: Key): Key {
//    var inserting: any = { value: serialize(value) };
//    if (key) inserting.id = key;
//    var insertedIds = await(db.table(table).insert(inserting));
//    key = key || insertedIds[0];
//    return key;
//}
//function set(table: string, key: Key, value: any): void {
//    var serializedValue = serialize(value);
//    await(db.table(table).update({ value: serializedValue }).where('id', key));
//}
//function del(table: string, key: Key) {
//    await(db.table(table).delete().where('id', key));
//}
// TODO: add `where` param (eg for event loop searching for what it can schedule)
// TODO: cache this one - it could be slow. Should only use at startup time (and event loop??)
function find(record) {
    var query = db.table(record.type).select('value');
    if (record.id)
        query = query.where('id', record.id);
    var rows = await(query);
    var results = rows.map(function (row) { return deserialize(row.value); });
    return results;
}
module.exports = api;
//# sourceMappingURL=index.js.map