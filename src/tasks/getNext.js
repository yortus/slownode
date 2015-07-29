var _this = this;
var toTask = require("../toTask");
var getNext = function () {
    var self = _this;
    return self.store("tasks")
        .select()
        .where("runAt", "<=", Date.now())
        .orderBy("runAt", "asc")
        .orderBy("id", "asc")
        .limit(1)
        .then(function (rows) { return rows.length > 0 ? toTask(rows[0]) : null; });
};
module.exports = getNext;
//# sourceMappingURL=getNext.js.map