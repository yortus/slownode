




export function replacer(key, val) {
    if (val === void 0) return {$type: 'undefined'};
    return val;
}





export function reviver(key, val) {
    if (val && val.$type === 'undefined') return void 0;
    return val;
}
