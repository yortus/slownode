var settings = require("../../settings");
function add(listener) {
    return settings.connection("listener")
        .insert(listener);
}
module.exports = add;
//# sourceMappingURL=add.js.map