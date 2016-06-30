import {createGlobal, isGlobal} from '../../../global-object/global-object';





export function replacer(key: string, val: any) {
    if (!isGlobal(val)) return val;

// TODO: only serialize changed props!
    let keys = Object.keys(val);
    return { $type: 'Global', props: keys.reduce((props, key) => (props[key] = val[key], props), {}) };
}





export function reviver(key: string, val: any) {
    if (!val || val.$type !== 'Global') return val;

// TODO: do reverse of replacer (once that's fixed)...
    let g = createGlobal();
    Object.keys(val.props).forEach(key => g[key] = val.props[key]);
    return g;
}
