// TODO: this only handles plain objects, should it more derived objects?





export function replacer(key, val) {
    return val;

    // if (!val || Object.getPrototypeOf(val) !== Object.prototype) return val;
    // if (!val.hasOwnProperty('type')) return val;

    // let result = Object.keys(val).reduce((res, key) => (res[key] = val[key], res), <any> {});
    // result.type = ['builtin.Object', val.type];
    // return result;








    // if (finalized.has(val)) return val;

    // finalized.add(val);

    // let result: any = Object.keys(val).reduce((props, key) => (props[key] = val[key], props), {});
    // result.type = 'builtin.Object';
    // return result;








//    return Object.keys(val).reduce((res, key) => (res[`-${key}`] = val[key], res), {});


    // let keys = Object.keys(val);
    // return box({
    //     type: 'builtin.Object',
    //     ownEnumProps: box(keys.reduce((props, key) => (props[key] = val[key], props), {}))
    // });
}





export function reviver(key, val) {
    throw new Error(`Not implemented`);
}
