function flush() {
    var self = this;
    // TODO: Retry/failure handling
    return self.getNextEvent()
        .then(self.processEvent);
}
;
module.exports = flush;
//# sourceMappingURL=flush.js.map