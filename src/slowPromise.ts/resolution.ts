import Types = require("slownode");
import async = require("asyncawait/async");
import await = require("asyncawait/await");
import db = require("../knexConnection");

export function resolve(slowPromise: Types.SlowPromise) {
    var resolveFn = async((value) => {
        await(db("SlowPromise")
            .update("value", value)
            .where("id", "=", slowPromise._id));
    });
    
    //TODO: Call then handler(s)
    
    return resolveFn;
}

export function reject(slowPromise: Types.SlowPromise) {
    var resolveFn = async((reason) => {
        await(db("SlowPromise")
            .update("reject", reason)
            .where("id", "=", slowPromise._id));
    });
    
    //TODO: Call catch handler
    
    return resolveFn;
}