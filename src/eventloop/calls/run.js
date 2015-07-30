function run(event) {
    var self = this;
    if (!event) {
        self.flushCallback = setTimeout(function () { return self.start(); }, self.config.pollIntervalMs);
        return Promise.resolve(true);
    }
    var runPromise = Promise.resolve(true);
    return runPromise;
}
;
function execute(subscriber, event) {
    //TODO: Update db according to subscriber config
    return subscriber.callback(event.arguments)
        .then(function () { return true; });
}
module.exports = run;
//# sourceMappingURL=run.js.map