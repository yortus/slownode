var SlowNode = require("../../index");
var addFunction = require("./add");
var addCall = require("../eventLoop/add");
function addTimed(slowFunc) {
    slowFunc.options.runOnce = 1;
    var timedId = 0;
    return SlowNode.connection.transaction(function (trx) {
        addFunction(slowFunc)
            .transacting(trx)
            .then(function () { return addCall(slowFunc.id, slowFunc.options).transacting(trx); })
            .then(function (ids) { return timedId = ids[0]; })
            .then(trx.commit)
            .then(function () { return timedId; })
            .catch(trx.rollback);
    }).then(function () { return slowFunc.id; });
}
module.exports = addTimed;
//# sourceMappingURL=addTimed.js.map