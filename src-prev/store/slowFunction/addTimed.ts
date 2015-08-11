import Types = require("slownode-prev");
import settings = require("../../settings");
import toStorable = require("./toStorable");
import addFunction = require("./add");
import addCall = require("../eventLoop/add");
import errors = require("../../errors");
export = addTimed;

function addTimed(slowFunc: Types.SlowFunction) {
    slowFunc.options.runOnce = 1;
    
    var timedId = 0;

    return settings.connection.transaction(trx => {
        addFunction(slowFunc)
            .transacting(trx)
            .then(() => addCall(slowFunc.id, slowFunc.options).transacting(trx))
            .then(ids => timedId = ids[0])
            .then(trx.commit)
            .then(() => timedId)
            .catch(trx.rollback)
    }).then(() => slowFunc.id);
}
