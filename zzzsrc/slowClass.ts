import SlowObject = require('./slowObject');
import SlowLog = require('./slowLog');
export = SlowClass;


declare class SlowClass implements SlowObject {

    constructor(...args);

    $slow: any;

    $slowLog: SlowLog;

}
