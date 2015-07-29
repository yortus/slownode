var _this = this;
var flush = function () {
    var self = _this;
    self.getNextTask()
        .then(self.runTask);
    return true;
};
module.exports = flush;
//# sourceMappingURL=flush.js.map