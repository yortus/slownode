var _this = this;
// TODO: Persist subscriber changes
var remove = function (subscriberId) {
    var self = _this;
    var subscriber = self.subscribers[subscriberId] || {};
    var isExisting = !!subscriber;
    if (!isExisting)
        return false;
    return delete self.subscribers[subscriber];
};
module.exports = remove;
//# sourceMappingURL=remove.js.map