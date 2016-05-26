// TODO: doc... this papers over some peculiarities of babel-core (for node) vs babel-standalone (for browsers)
'use strict';
import {transform, transformFile} from 'babel-standalone';
import * as t from 'babel-types';





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
