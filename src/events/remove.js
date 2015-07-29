var _this = this;
var remove = function (task) {
    var self = _this;
    return self.store("tasks")
        .delete()
        .where("id", "=", task.id);
};
module.exports = remove;
//# sourceMappingURL=remove.js.map