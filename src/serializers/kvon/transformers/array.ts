




export function replacer(key, val) {
    if (!val || Object.getPrototypeOf(val) !== Array.prototype) return val;
    if (!isSparseOrHybrid(val)) return val;
    return <ArrayInfo> {
        $: 'Array',
        props: Object.keys(val).reduce((props, key) => (props[key] = val[key], props), {})
    };
}





export function reviver(key, val: {}) {
    if (!isArrayInfo(val)) return val;
    let props = val.props;
    let result = Object.keys(props).reduce((ar, key) => (ar[key] = props[key], ar), []);
    return result;
}





function isSparseOrHybrid(ar: any[]) {
    let keys = Object.keys(ar);
    if (keys.length !== ar.length) return true;
    return keys.some((k, i) => k !== `${i}`);
}





function isArrayInfo(x: any): x is ArrayInfo {
    return x && x.$ === 'Array';
}





interface ArrayInfo {
    $: 'Array';
    props: {};
}
