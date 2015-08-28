import assert = require('assert');
import types = require('types');


// TODO: ...
export function store(registration: types.SlowObject.Registration) {
    assert(!registry[registration.type]);
    registry[registration.type] = registration;
}


// TODO: ...
export function fetch(type: string): types.SlowObject.Registration {
    assert(registry[type]);
    return registry[type];
}


// TODO: ...
var registry: { [slowObjectType: string]: types.SlowObject.Registration; } = {};
