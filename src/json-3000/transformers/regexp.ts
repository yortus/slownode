'use strict';





export function replacer(key, val) {
    if (!val || Object.getPrototypeOf(val) !== RegExp.prototype) return val;
    return {
        type: 'builtin.RegExp',
        pattern: val.source,
        flags: 'TODO', // TODO: ...
        lastIndex: val.lastIndex
    };
}





export function reviver(key, val) {
    throw new Error(`Not implemented`);
}
