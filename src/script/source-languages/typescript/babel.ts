// TODO: doc... this papers over some peculiarities of babel-core (for node) vs babel-standalone (for browsers)
import * as babel from 'babel-core';
import * as t from 'babel-types';
const {transform, transformFile} = <typeof babel> require('babel-standalone');





// TODO: augment nodes with scope info...
declare module 'babel-types' {

    interface Node {
        scope?: {[name: string]: BindingKind};
    }

    type BindingKind = 'var'|'let'|'const'|'hoisted'|'param'|'module';
}





// TODO: exports...
export {transform, transformFile};
export let types: typeof t;





// TODO: explain... this establishes the value for the 'types' export...
transform('', {
    plugins: [
        (b: { types: typeof t}) => {
            types = b.types;
            return { visitor: {} };
        }
    ]
});
