




export function replacer(key, val) {
    if (Object.is(val, -0)) return {$: '-0'};
    return val;
}





export function reviver(key, val) {
    if (val && val.$ === '-0') return -0;
    return val;
}
