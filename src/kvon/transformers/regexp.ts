




export function replacer(key, val) {
    if (!val || Object.getPrototypeOf(val) !== RegExp.prototype) return val;
    return <RegExpInfo> {
        $: 'RegExp',
        pattern: val.source,
        flags: val.toString().match(/[gimuy]*$/)[0], // NB: RegExp#flags is only available in ES6+
        lastIndex: val.lastIndex
    };
}





export function reviver(key, val: {}) {
    if (!isRegExpInfo(val)) return val;
    let result = new RegExp(val.pattern, val.flags);
    result.lastIndex = val.lastIndex;
    return result;
}





function isRegExpInfo(x: any): x is RegExpInfo {
    return x && x.$ === 'RegExp';
}





interface RegExpInfo {
    $: 'RegExp';
    pattern: string;
    flags: string;
    lastIndex: number;
}
