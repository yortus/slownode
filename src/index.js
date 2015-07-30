var immediate = require("./function/setImmediate");
var timeout = require("./function/setTimeout");
var interval = require("./function/setInterval");
var api = {
    setTimeout: timeout,
    setImmediate: immediate,
    setInterval: interval,
    EventEmitter: null,
    Promise: null,
};
//# sourceMappingURL=index.js.map