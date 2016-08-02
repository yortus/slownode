




export function replacer(key, val) {
    if (val === Infinity) return {$: 'Infinity'};
    if (val === -Infinity) return {$: '-Infinity'};
    return val;
}





export function reviver(key, val) {
    if (val && val.$ === 'Infinity') return Infinity;
    if (val && val.$ === '-Infinity') return -Infinity;
    return val;
}
