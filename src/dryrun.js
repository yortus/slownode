var start = require("./start");
var stop = require("./stop");
stop().then(function () { return start({ pollIntervalMs: 100 }); });
//# sourceMappingURL=dryrun.js.map