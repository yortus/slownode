var slowObjectFactories = require('./slowObjectFactories');
// TODO: need to account for $slowLog too...
function registerSlowObjectFactory(type, factory) {
    slowObjectFactories[type] = factory;
}
module.exports = registerSlowObjectFactory;
//# sourceMappingURL=registerSlowObjectFactory.js.map