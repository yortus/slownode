import SlowType = require('./slowType');
export = SlowObject;


/** The underlying structure common to all slow object types. */
interface SlowObject {
    $slow: {

        /** The type of this slow object. */
        type: SlowType;

        /** The epoch-unique identifier assigned to this slow object. */
        id?: string;

        [other: string]: any;
    }

    [other: string]: any;
}
