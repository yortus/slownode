import GlobalFactory from '../../global-factory';
import Global from './global';
import isGlobal from './is-global';





// TODO: ...
export default <GlobalFactory> {create, replacer, reviver};





// TODO: ...
function create() {
    return new Global();
}





// TODO: ...
function replacer(key: string, val: any) {
    if (!isGlobal(val)) return val;

// TODO: only serialize changed props!
    let keys = Object.keys(val);
    return { $: 'Global', props: keys.reduce((props, key) => (props[key] = val[key], props), {}) };
}





// TODO: ...
function reviver(key: string, val: any) {
    if (!val || val.$ !== 'Global') return val;

// TODO: do reverse of replacer (once that's fixed)...
    let g = create();
    Object.keys(val.props).forEach(key => g[key] = val.props[key]);
    return g;
}
