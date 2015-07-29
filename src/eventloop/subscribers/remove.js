// TODO: Persist subscriber changes
function remove(subscriberId) {
    var self = this;
    var subscriber = self.subscribers[subscriberId] || {};
    var isExisting = !!subscriber;
    if (!isExisting)
        return false;
    return delete self.subscribers[subscriber];
}
;
module.exports = remove;
//# sourceMappingURL=remove.js.map