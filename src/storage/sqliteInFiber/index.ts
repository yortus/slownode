import fs = require('fs');
import path = require('path');
import await = require('asyncawait/await');
import Knex = require('knex');
import databaseLocation = require('./databaseLocation');
import serialize = require('../serialize');
import deserialize = require('../deserialize');
import API = require('../api');
type Key = number|string;
export = api;


// TODO: all DB ops below assume there is a containing Fiber! Doc how to use this properly...
// TODO: errors are not caught... What to do?


// TODO: doc... lazy inited inside init()
var db: Knex;


var api: API = { init, add, get, set, del, find };


function init() {

    // Check if the database already exists. Use fs.stat since fs.exists is deprecated.
    var dbExists = true;
    try { fs.statSync(databaseLocation); } catch (ex) { dbExists = false; }

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


function add(table: string, value: any, key?: Key): Key {
    var inserting: any = { value: serialize(value) };
    if (key) inserting.id = key;
    var insertedIds = await(db.table(table).insert(inserting));
    key = key || insertedIds[0];
    return key;
}


function get(table: string, key: Key): any {
    var rows = await(db.table(table).select('value').where('id', key));
    return rows.length === 0 ? void 0 : deserialize(rows[0].value);
}


function set(table: string, key: Key, value: any): void {
    var serializedValue = serialize(value);
    await(db.table(table).update({ value: serializedValue }).where('id', key));
}


function del(table: string, key: Key) {
    await(db.table(table).delete().where('id', key));
}


// TODO: add `where` param (eg for event loop searching for what it can schedule)
function find(table: string) {
    var rows: any[] = await(db.table(table).select('id', 'value'));
    var results = rows.map(row => ({ id: <Key> row.id, value: deserialize(row.value) }));
    return results;
}
