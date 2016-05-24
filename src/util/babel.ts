// TODO: doc... this papers over some peculiarities of babel-core (for node) vs babel-standalone (for browsers)
'use strict';
import * as b from 'babel';
import * as t from 'babel-types';






let babel: typeof b = require('../../babel.min.js');
// try {
//     babel = require('babel');
// } catch (ex) {
//     babel = require('babel-core');
// }
let {transform, transformFile} = babel;





export {transform, transformFile};
export let types: typeof t;





transform('', {
    plugins: [
        (b: { types: typeof t}) => {
            types = b.types;
            return { visitor: {} };
        }
    ]
});
