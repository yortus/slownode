




export function replacer(key, val) {
    if (Number.isNaN(val)) return {$: 'NaN'};
    return val;
}





export function reviver(key, val) {
    if (val && val.$ === 'NaN') return NaN;
    return val;
}
