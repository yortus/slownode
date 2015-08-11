import settings = require("../../settings");
import Types = require("slownode-prev");
export = get;

// TODO: Type definition
function get(promiseId: number) {
    
    return settings
        .connection("promise")
        .select()
        .where("id", "=", promiseId)
        .leftJoin("function", "promise.onReject", "function.id");
}
