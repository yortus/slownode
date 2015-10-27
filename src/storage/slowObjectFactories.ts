import SlowKind = require('../slowKind');
import SlowObject = require('../slowObject');
export = slowObjectFactories;


var slowObjectFactories: SlowObjectFactories = {};


// TODO: temp testing...
type SlowObjectFactories = { [type: number]: ($slow: { kind: SlowKind, id?: string }) => SlowObject; };
