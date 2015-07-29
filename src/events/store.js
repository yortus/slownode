var Promise = require("bluebird");
var toRow = require("../toRow");
function store(db, tasks) {
    return db.transaction(function (trx) {
        return Promise.map(tasks, function (task) { return toInsert(db, task, trx); })
            .then(trx.commit);
    });
}
function toInsert(db, task, trx) {
    return db("tasks")
        .insert(toRow(task))
        .transacting(trx);
}
module.exports = store;
//# sourceMappingURL=store.js.map