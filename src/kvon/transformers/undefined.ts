




export function replacer(key, val) {
    if (val === void 0) return {$: 'undefined'};
    return val;
}





export function reviver(key, val) {
    if (val && val.$ === 'undefined') return void 0;
    return val;
}
