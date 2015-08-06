var store = require("../store/index");
function slowFunction(id, callback, options) {
    options = options || {};
    var slowFunc = {
        id: id,
        body: callback,
        options: options
    };
    // TODO: Option validation..
    return store.addFunction(slowFunc)
        .then(function () { return id; });
}
module.exports = slowFunction;
//# sourceMappingURL=declare.js.map