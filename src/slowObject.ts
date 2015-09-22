import SlowType = require('./slowType');
export = SlowObject;


interface SlowObject {
    $slow: {
        type: SlowType;
        id?: string;
        [other: string]: any;
    }
    [other: string]: any;
}
