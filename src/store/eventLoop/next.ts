import Types = require("slownode");
import settings = require("../../settings");
export = next;

function next(): Promise<Types.Schema.EventLoop> {
    var now = Date.now();

    return settings.connection("eventLoop")
        .select()
        .where("runAt", ">=", 0)
        .andWhere("runAt", "<=", now)
        .orderBy("id", "asc")
        .limit(1)
        .then(calls => calls[0])
}
