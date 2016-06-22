// TODO: doc... this papers over some peculiarities of babel-core (for node) vs babel-standalone (for browsers)
import {transform, transformFile} from 'babel-standalone';
import * as t from 'babel-types';





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
