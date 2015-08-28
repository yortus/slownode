var assert = require('assert');
// TODO: ...
function store(registration) {
    assert(!registry[registration.type]);
    registry[registration.type] = registration;
}
exports.store = store;
// TODO: ...
function fetch(type) {
    assert(registry[type]);
    return registry[type];
}
exports.fetch = fetch;
// TODO: ...
var registry = {};
//# sourceMappingURL=typeRegistry.js.map