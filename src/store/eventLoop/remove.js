var settings = require("../../settings");
function remove(id) {
    return settings.connection("eventLoop")
        .delete()
        .where("id", "=", id);
}
module.exports = remove;
//# sourceMappingURL=remove.js.map