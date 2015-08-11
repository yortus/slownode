var settings = require("../../settings");
function get(event) {
    return settings.connection("listener")
        .select()
        .where("topic", "=", event)
        .innerJoin("function", "listener.funcId", "function.id");
}
module.exports = get;
//# sourceMappingURL=get.js.map