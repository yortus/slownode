var settings = require("../../settings");
function removeAll(event) {
    return settings.connection("listener")
        .delete()
        .where("topic", "=", event);
}
module.exports = removeAll;
//# sourceMappingURL=removeAll.js.map