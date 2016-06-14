'use strict';





export function replacer(key, val) {
    if (!val || Object.getPrototypeOf(val) !== RegExp.prototype) return val;
    return {
        type: 'builtin.RegExp',
        pattern: val.source,
        flags: val.toString().match(/[gimuy]*$/)[0], // NB: RegExp#flags is only available in ES6+
        lastIndex: val.lastIndex
    };
}





export function reviver(key, val) {
    throw new Error(`Not implemented`);
}
