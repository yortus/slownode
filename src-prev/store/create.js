var async = require('asyncawait/async');
var await = require('asyncawait/await');
var create = async(function (db) {
    await(db.schema.createTable("function", functionTable));
    await(db.schema.createTable("eventLoop", eventLoopTable));
    await(db.schema.createTable("listener", listenerTable));
    await(db.schema.createTable("promise", promiseTable));
});
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