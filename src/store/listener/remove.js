var settings = require("../../settings");
function remove(event) {
    return settings.connection("listener")
        .delete()
        .where("topic", "=", event)
        .limit(1);
}
module.exports = remove;
//# sourceMappingURL=remove.js.map