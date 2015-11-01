import SlowKind = require('./slowKind');
import SlowLog = require('./slowLog'); // NB: elided circular ref (for types only)
export = SlowObject;


/** The underlying structure common to all slow object types. */
interface SlowObject {
    $slow: {

        /** The kind of this slow object. */
        kind: SlowKind;

        /** The epoch-unique identifier assigned to this slow object. */
        id: string;

        [other: string]: any;
    }

    $slowLogAttach(): void;
    $slowLogDetach(): void;

    [other: string]: any;
}
