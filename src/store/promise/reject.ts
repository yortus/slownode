import settings = require("../../settings");
import Types = require("slownode");
export = reject;

function reject(promiseId: number) {
    
    return settings
        .connection("promise")
        .update({ state: 2 })
        .where("id", "=", promiseId);    
}
