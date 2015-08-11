import settings = require("../../settings");
import Types = require("slownode-prev");
export = add;

function add(promise: Types.Schema.Promise) {
    // State validation?
    
    return settings
        .connection("promise")
        .insert(promise);
}
