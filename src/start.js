var validateConfig = require("./validateConfig");
function start(config) {
    var self = this;
    // TODO: More?
    validateConfig(config);
    self.configuration = config;
}
module.exports = start;
//# sourceMappingURL=start.js.map