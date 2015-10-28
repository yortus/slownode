import SlowObject = require('./slowObject');
import SlowLog = require('./slowLog');
export = SlowClass;


declare class SlowClass {

    constructor(...args);

    $slowLog: SlowLog;

}
