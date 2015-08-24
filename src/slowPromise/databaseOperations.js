var assert = require('assert');
var Types = require("slownode");
var async = require("asyncawait/async");
var await = require("asyncawait/await");
var db = require("../knexConnection");
var serialize = require('../serialization/serialize');
var deserialize = require('../serialization/deserialize');
// See https://github.com/promises-aplus/promises-spec
// See https://github.com/promises-aplus/constructor-spec/issues/18
/** Adds a new SlowPromise record to the database and returns a promise of its ID. */
exports.create = async(function () {
    var insertedIds = await(db.table('Promise').insert({ state: 0 /* FateUnresolved */ }));
    assert(insertedIds.length === 1);
    return insertedIds[0];
});
/**
 * Finds the SlowPromise with the given ID in the database, updates its state to Resolved,
 * and sets its resolved value to the serialized value of the given value. Has no effect
 * if the SlowPromise's fate is already resolved.
 */
exports.resolve = async(function (spid, value) {
    // Look up the SlowPromise and return early if its fate is already resolved.
    var rows = await(db.table('Promise').select('state').where('id', spid));
    assert(rows.length === 1);
    if (rows[0].state !== 0 /* FateUnresolved */)
        return;
    // Resolve the SlowPromise in the database.
    var serializedValue = serialize(value);
    await(db.table('Promise').update({ state: 2 /* FateResolvedStateResolved */, value: serializedValue }).where('id', spid));
});
/**
 * Finds the SlowPromise with the given ID in the database, updates its state to Rejected,
 * and sets its rejection reason to the serialized value of the given reason. Has no effect
 * if the SlowPromise's fate is already resolved.
 */
exports.reject = async(function (spid, reason) {
    // Look up the SlowPromise and return early if its fate is already resolved.
    var rows = await(db.table('Promise').select('state').where('id', spid));
    assert(rows.length === 1);
    if (rows[0].state !== 0 /* FateUnresolved */)
        return;
    // Resolve the SlowPromise in the database.
    var serializedReason = serialize(reason);
    await(db.table('Promise').update({ state: 2 /* FateResolvedStateResolved */, value: serializedReason }).where('id', spid));
});
/** Finds the SlowPromise with the given ID in the database, and returns its details. */
exports.fetchOne = async(function (spid) {
    var rows;
    rows = await(db.table('Promise').select('state', 'value').where('id', spid));
    assert(rows.length === 1);
    rows[0].value = deserialize(rows[0].value);
    return rows[0];
});
//# sourceMappingURL=databaseOperations.js.map