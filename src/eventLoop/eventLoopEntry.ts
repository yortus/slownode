import SlowKind = require('../slowKind');
import SlowLog = require('../slowLog');
export = EventLoopEntry;


interface EventLoopEntry {

    $slow: {
        kind: SlowKind;
        id: string;
        due: number;
        callback: Function;
        arguments: any[];
    };

    $slowLog: SlowLog;
}
