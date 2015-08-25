//import assert = require('assert');
//import Types = require("slownode");
//import async = require("asyncawait/async");
//import await = require("asyncawait/await");
//import db = require("../knexConnection");
//import serialize = require('../serialization/serialize');
//import deserialize = require('../serialization/deserialize');
//// See https://github.com/promises-aplus/promises-spec
//// See https://github.com/promises-aplus/constructor-spec/issues/18
///** Adds a new SlowPromise record to the database and returns a promise of its ID. */
//export var create = async(() => {
//    var insertedIds: number[] = await(db.table('Promise').insert({ state: Types.SlowPromiseState.Unresolved }));
//    assert(insertedIds.length === 1);
//    return insertedIds[0];
//});
///**
// * Finds the SlowPromise with the given ID in the database, updates its state to Resolved,
// * and sets its resolved value to the serialized value of the given value. Has no effect
// * if the SlowPromise's fate is already resolved.
// */
//export var resolve = async((spid: number, value: any) => {
//    // Look up the SlowPromise and return early if its fate is already resolved.
//    var rows: { state: Types.SlowPromiseState }[] = await(db.table('Promise').select('state').where('id', spid));
//    assert(rows.length === 1);
//    if (rows[0].state !== Types.SlowPromiseState.Unresolved) return;
//    // Resolve the SlowPromise in the database.
//    var serializedValue = serialize(value);
//    await(db.table('Promise').update({ state: Types.SlowPromiseState.Fulfilled, value: serializedValue }).where('id', spid));
//});
///**
// * Finds the SlowPromise with the given ID in the database, updates its state to Rejected,
// * and sets its rejection reason to the serialized value of the given reason. Has no effect
// * if the SlowPromise's fate is already resolved.
// */
//export var reject = async((spid: number, reason: any) => {
//    // Look up the SlowPromise and return early if its fate is already resolved.
//    var rows: { state: Types.SlowPromiseState }[] = await(db.table('Promise').select('state').where('id', spid));
//    assert(rows.length === 1);
//    if (rows[0].state !== Types.SlowPromiseState.Unresolved) return;
//    // Resolve the SlowPromise in the database.
//    var serializedReason = serialize(reason);
//    await(db.table('Promise').update({ state: Types.SlowPromiseState.Fulfilled, value: serializedReason }).where('id', spid));
//});
///** Finds the SlowPromise with the given ID in the database, and returns its details. */
//export var fetchOne = async((spid: number) => {
//    var rows: { state: Types.SlowPromiseState, value: any }[];
//    rows = await(db.table('Promise').select('state', 'value').where('id', spid));
//    assert(rows.length === 1);
//    rows[0].value = deserialize(rows[0].value);
//    return rows[0];
//});
//# sourceMappingURL=databaseOperations.js.map