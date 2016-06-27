




export function replacer(key, val) {
    if (Number.isNaN(val)) return {$type: 'NaN'};
    return val;
}





export function reviver(key, val) {
    if (val && val.$type === 'NaN') return NaN;
    return val;
}
