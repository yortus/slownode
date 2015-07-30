var Promise = require("bluebird");
function create(db) {
    return Promise.delay(500)
        .then(function () { return tableExists(db); })
        .then(function (exists) { return createTable(db, exists); })
        .then(function () { return Promise.resolve(true); });
}
function tableExists(db) {
    return db.schema.hasTable("events");
}
function createTable(db, exists) {
    if (exists)
        return Promise.resolve(true);
    return db.schema.createTable("events", function (table) {
        table.increments("id").primary();
        table.bigInteger("runAt");
        table.text("runAtReadble");
        table.text("eventName");
        table.text("event");
    }).then(function () { return Promise.resolve(true); });
}
module.exports = create;
//# sourceMappingURL=create.js.map