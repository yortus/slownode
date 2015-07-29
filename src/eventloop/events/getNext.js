var toEvent = require("../toEvent");
function getNext() {
    var self = this;
    return self.store("events")
        .select()
        .where("runAt", "<=", Date.now())
        .orderBy("runAt", "asc")
        .orderBy("id", "asc")
        .limit(1)
        .then(function (rows) { return rows.length > 0 ? toEvent(rows[0]) : null; });
}
;
module.exports = getNext;
//# sourceMappingURL=getNext.js.map