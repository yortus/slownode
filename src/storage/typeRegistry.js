var assert = require('assert');
// TODO: ...
function store(registration) {
    assert(!registry[registration.type], "type already registered: '" + registration.type + "'");
    registry[registration.type] = registration;
}
exports.store = store;
// TODO: ...
function fetch(type) {
    assert(registry[type], "type not registered: '" + type + "'");
    return registry[type];
}
exports.fetch = fetch;
// TODO: ...
var registry = {};
//# sourceMappingURL=typeRegistry.js.map