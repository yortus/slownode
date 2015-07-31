var Promise = require("bluebird");
var errors = require("../errors");
var tables = ["functions", "eventloop", "events", "listeners"];
function create(db) {
    return Promise.delay(500)
        .then(function () { return tablesExists(db); })
        .then(function (exists) { return createTable(db, exists); })
        .then(function () { return Promise.resolve(true); });
}
function tablesExists(db) {
    var toPromise = function (table) { return db.schema.hasTable(table); };
    return Promise.all(tables.map(toPromise));
}
function createTable(db, exists) {
    if (exists.every(function (e) { return e === true; }))
        return Promise.resolve(true);
    if (exists.some(function (e) { return e === true; }))
        throw new Error(errors.DatabaseInvalid);
    var promises = [db.schema.createTable("events", eventTable),
        db.schema.createTable("functions", functionTable),
        db.schema.createTable("eventloop", eventLoopTable),
        db.schema.createTable("eventListeners", eventListenersTable)];
    return Promise.all(promises)
        .then(function () { return true; });
}
function eventTable(table) {
    table.increments("id").primary();
    table.text("topic");
    table.text("arguments");
    table.bigInteger("createdAt");
    table.text("createdAtReable");
}
function functionTable(table) {
    table.increments("id").primary();
    table.text("name");
    table.text("function");
}
function eventLoopTable(table) {
    table.increments("id").primary();
    table.text("function"); // Function identity or 'inline' function
    table.integer("runAt"); // 0 --> N
    table.text("runAtReadable");
    table.integer("repeat");
    table.text("arguments"); // JSON array
}
function eventListenersTable(table) {
    table.increments("id").primary();
    table.text("topic");
    table.text("functionId");
    table.integer("runOnce");
}
module.exports = create;
//# sourceMappingURL=create.js.map