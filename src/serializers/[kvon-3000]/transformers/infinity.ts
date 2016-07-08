




export function replacer(key, val) {
    if (val === Infinity) return {$type: 'Infinity'};
    if (val === -Infinity) return {$type: '-Infinity'};
    return val;
}





export function reviver(key, val) {
    if (val && val.$type === 'Infinity') return Infinity;
    if (val && val.$type === '-Infinity') return -Infinity;
    return val;
}
