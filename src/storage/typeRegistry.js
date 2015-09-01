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
function fetchAll() {
    return Object.keys(exports._cache).map(function (key) { return exports._cache[key]; });
}
exports.fetchAll = fetchAll;
// TODO: ...
var registry = {};
// TODO: temp testing... remove this...
exports._cache = registry;
//# sourceMappingURL=typeRegistry.js.map