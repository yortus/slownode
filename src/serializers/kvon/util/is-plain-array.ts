




/**
 * Detects whether the given value is a plain array suitable for simple KVON serialization.
 * Performs a range of checks aimed at ensuring that, given plain arrays A1 and A2 such that
 * A2 := parse(stringify(A1)), then A1 and A2 are functionally indistinguishable. A notable
 * exception to this is if A1 is an ES6 proxy, since there is no way to detect a proxy object.
 */
export default function isPlainArray(x: any): x is any[] {
    if (!x || Object.getPrototypeOf(x) !== Array.prototype) return false;
    if (Object.getOwnPropertySymbols(x).length > 0) return false;
    let keys = Object.getOwnPropertyNames(x);
    if (keys.pop() !== 'length') return false; // no worries about about 'length' tampering, since it's not configurable
    if (keys.length !== x.length) return false;
    if (keys.some((k, i) => k !== `${i}`)) return false;
    for (let i = 0; i < keys.length; ++i) {
        let d = Object.getOwnPropertyDescriptor(x, keys[i]);
        if (!d.enumerable || !d.configurable || !d.writable) return false;
        if (d.get || d.set) return false;
    }
    return true;
}
