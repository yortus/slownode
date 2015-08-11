var SlowNode = require("./index");
SlowNode.stop()
    .then(function () { return SlowNode.start({ pollIntervalMs: 100 }); });
//# sourceMappingURL=dryrun.js.map