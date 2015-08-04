var Promise = require("bluebird");
var errors = require("../errors");
var index_1 = require("../index");
var tables = ["function", "eventLoop", "event", "eventListener"];
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
    var promises = [index_1.connection.schema.createTable("event", eventTable),
        index_1.connection.schema.createTable("function", functionTable),
        index_1.connection.schema.createTable("eventLoop", eventLoopTable),
        index_1.connection.schema.createTable("eventListener", eventListenersTable)];
    return Promise.all(promises)
        .then(function () { return true; });
}
function functionTable(table) {
    table.text("id").unique();
    table.text("body");
    table.text("dependencies");
    table.bigInteger("intervalMs");
    table.integer("retryCount"); // 0 -> N
    table.bigInteger("retryIntervalMs");
}
function eventLoopTable(table) {
    table.increments("id").primary();
    table.text("funcId");
    table.bigInteger("runAt"); // 0 --> N
    table.text("runAtReadable");
    table.text("arguments"); // JSON array
}
function eventTable(table) {
    table.increments("id").primary();
    table.text("topic");
    table.text("arguments");
    table.bigInteger("createdAt");
    table.text("createdAtReable");
}
function eventListenersTable(table) {
    table.increments("id").primary();
    table.text("topic");
    table.text("functionId");
    table.integer("runOnce");
}
module.exports = create;
//# sourceMappingURL=create.js.map