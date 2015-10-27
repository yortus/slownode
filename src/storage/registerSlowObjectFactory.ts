import SlowKind = require('../slowKind');
import SlowObject = require('../slowObject');
import slowObjectFactories = require('./slowObjectFactories');
export = registerSlowObjectFactory;


// TODO: need to account for $slowLog too...
function registerSlowObjectFactory(type: SlowKind, factory: ($slow: { kind: SlowKind, id: string }) => SlowObject) {
    slowObjectFactories[type] = factory;
}
