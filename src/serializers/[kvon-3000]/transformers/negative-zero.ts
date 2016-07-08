




export function replacer(key, val) {
    if (Object.is(val, -0)) return {$type: '-0'};
    return val;
}





export function reviver(key, val) {
    if (val && val.$type === '-0') return -0;
    return val;
}
