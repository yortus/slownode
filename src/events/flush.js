var _this = this;
var flush = function () {
    var self = _this;
    // TODO: Retry/failure handling
    return self.getNextEvent()
        .then(self.processEvent);
};
module.exports = flush;
//# sourceMappingURL=flush.js.map