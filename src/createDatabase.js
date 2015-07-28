function create(db) {
    return hasTable(db)
        .then(function (exists) { return createTable(db, exists); });
}
function hasTable(db) {
    return db.schema.hasTable("tasks");
}
function createTable(db, exists) {
    if (exists)
        return Promise.resolve(true);
    return db.schema.table("tasks", function (table) {
        table.bigInteger("id").primary();
        table.bigInteger("runAt");
        table.text("runAtReadble");
        table.text("topicFilter");
        table.text("functionId");
        table.text("task");
    }).then(function () { return Promise.resolve(true); });
}
module.exports = create;
//# sourceMappingURL=createDatabase.js.map