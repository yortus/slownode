function flush() {
    var self = this;
    // TODO: Retry/failure handling
    return self.getNextCall()
        .then(self.processCall);
}
;
module.exports = flush;
//# sourceMappingURL=flush.js.map