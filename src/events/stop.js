function stop() {
    var self = this;
    if (self.flushCallback)
        clearTimeout(self.flushCallback);
}
;
module.exports = stop;
//# sourceMappingURL=stop.js.map