var Promise = require("bluebird");
function create(db) {
    return Promise.delay(500)
        .then(function () { return tableExists(db); })
        .then(function (exists) { return createTable(db, exists); })
        .then(function () { return Promise.resolve(true); });
}
function tableExists(db) {
    return db.schema.hasTable("tasks");
}
function createTable(db, exists) {
    if (exists)
        return Promise.resolve(true);
    return db.schema.createTable("tasks", function (table) {
        table.increments("id").primary();
        table.bigInteger("runAt");
        table.text("runAtReadble");
        table.text("topicFilter");
        table.text("functionId");
        table.text("task");
    }).then(function () { return Promise.resolve(true); });
}
module.exports = create;
//# sourceMappingURL=createDatabase.js.map