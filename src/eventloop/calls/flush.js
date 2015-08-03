function flush() {
    var self = this;
    // TODO: Retry/failure handling
    return self.getNext()
        .then(self.run);
}
;
module.exports = flush;
//# sourceMappingURL=flush.js.map