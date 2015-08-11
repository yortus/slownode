var settings = require("../../settings");
function add(promise) {
    // State validation?
    return settings
        .connection("promise")
        .insert(promise);
}
module.exports = add;
//# sourceMappingURL=add.js.map