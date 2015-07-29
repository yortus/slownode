var toRow = require("../toRow");
function store(db, event) {
    return db("tasks")
        .insert(toRow(event));
}
module.exports = store;
//# sourceMappingURL=store.js.map