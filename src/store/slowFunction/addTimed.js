var SlowNode = require("../../index");
var addFunction = require("./add");
var addCall = require("../eventLoop/add");
function addTimed(slowFunc) {
    var timedId = 0;
    SlowNode.connection.transaction(function (trx) {
        addFunction(slowFunc)
            .transacting(trx)
            .then(function () { return addCall(slowFunc.id, slowFunc.options).transacting(trx); })
            .then(function (ids) { return timedId = ids[0]; })
            .then(trx.commit)
            .then(function () { return timedId; })
            .catch(trx.rollback);
    });
}
module.exports = addTimed;
//# sourceMappingURL=addTimed.js.map