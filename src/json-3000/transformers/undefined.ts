




export function replacer(key, val) {
    if (val !== void 0) return val;
    return {$type: 'undefined'};
}





export function reviver(key, val) {
    if (!val || val.$type !== 'undefined') return val;
    return void 0;
}
