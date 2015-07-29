function remove(task) {
    var self = this;
    return self.store("events")
        .delete()
        .where("id", "=", task.id);
}
module.exports = remove;
//# sourceMappingURL=remove.js.map