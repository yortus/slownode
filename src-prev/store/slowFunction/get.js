var settings = require("../../settings");
function get(functionId) {
    return settings.connection("function")
        .select()
        .where("id", "=", functionId)
        .then(function (funcs) { return funcs[0]; });
}
module.exports = get;
//# sourceMappingURL=get.js.map