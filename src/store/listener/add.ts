import Types = require("slownode");
import settings = require("../../settings");
export = add;

function add(listener: Types.Schema.EventListener) {
    return settings.connection("listener")
        .insert(listener);
}
