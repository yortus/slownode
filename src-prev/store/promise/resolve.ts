import settings = require("../../settings");
import Types = require("slownode-prev");
export = resolve;

function resolve(promiseId: number) {
    
    return settings
        .connection("promise")
        .update({ state: 1 })
        .where("id", "=", promiseId);    
}
