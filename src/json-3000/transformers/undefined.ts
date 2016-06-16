




export function replacer(key, val) {
    if (val !== void 0) return val;
    return {
        type: 'builtin.undefined'
    };
}





export function reviver(key, val) {
    throw new Error(`Not implemented`);
}
