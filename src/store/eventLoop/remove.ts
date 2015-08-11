import Types = require("slownode");
import settings = require("../../settings");

export = remove;

function remove(id: number) {
    return settings.connection("eventLoop")
        .delete()
        .where("id", "=", id);
}
