// TODO: support special storage of Promise that rejects with 'EpochRestartError' on revival (or ExtinctionError?, UnrevivableError?, RevivalError?)





export function replacer(key, val) {
    if (!val || Object.getPrototypeOf(val) !== Promise.prototype) return val;

    // TODO: implement properly... handle DelayPromise...
    return { $type: 'Promise', value: ['???'] };
}





export function reviver(key, val) {
    if (!val || val.$type !== 'Promise') return val;

    // TODO: implement properly... handle DelayPromise...
    return Promise.resolve(42);
}
