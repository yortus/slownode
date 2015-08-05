var Promise = require("bluebird");
var errors = require("../errors");
var index_1 = require("../index");
var tables = ["function", "eventLoop", "listener", "promise"];
function create() {
    return tablesExists()
        .then(createTable)
        .then(function () { return Promise.resolve(true); });
}
function tablesExists() {
    var toPromise = function (table) { return index_1.connection.schema.hasTable(table); };
    return Promise.all(tables.map(toPromise));
}
function createTable(exists) {
    if (exists.every(function (e) { return e === true; }))
        return Promise.resolve(true);
    if (exists.some(function (e) { return e === true; }))
        throw new Error(errors.DatabaseInvalid);
    var promises = [
        index_1.connection.schema.createTable("function", functionTable),
        index_1.connection.schema.createTable("eventLoop", eventLoopTable),
        index_1.connection.schema.createTable("listener", listenerTable),
        index_1.connection.schema.createTable("promise", promiseTable)
    ];
    return Promise.all(promises)
        .then(function () { return true; });
}
function functionTable(table) {
    table.text("id").unique();
    table.text("body");
    table.text("dependencies");
    table.integer("isPromise").defaultTo(0); // 0 | 1
    table.bigInteger("intervalMs").defaultTo(0);
    table.integer("retryCount").defaultTo(0); // 0 -> N
    table.bigInteger("retryIntervalMs").defaultTo(0);
    table.integer("runOnce").defaultTo(0);
}
function eventLoopTable(table) {
    table.increments("id").primary();
    table.text("funcId");
    table.bigInteger("runAt").defaultTo(0); // 0 --> N
    table.text("runAtReadable").defaultTo("Immediately");
    table.text("arguments").defaultTo("[]"); // JSON array
}
function listenerTable(table) {
    table.increments("id").primary();
    table.text("topic");
    table.text("funcId");
}
function promiseTable(table) {
    table.increments("id").primary();
    table.text("funcId");
    table.integer("state").defaultTo(0);
    table.integer("onFulfill").defaultTo(0);
    table.integer("onReject").defaultTo(0);
    table.text("value");
}
module.exports = create;
//# sourceMappingURL=create.js.map