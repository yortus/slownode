import Types = require("slownode-prev");
import settings = require("../../settings");
export = add;

function add(listener: Types.Schema.EventListener) {
    return settings.connection("listener")
        .insert(listener);
}
