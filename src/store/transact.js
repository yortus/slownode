var Promise = require("bluebird");
var SlowNode = require("../index");
var db = SlowNode.connection;
var QueryBuilder = db("");
function transact(queries) {
    return db.transaction(function (trx) {
        queries.forEach(function (q) { return q.transacting(trx); });
        return Promise.all(queries)
            .then(trx.commit)
            .catch(trx.commit);
    });
}
//# sourceMappingURL=transact.js.map