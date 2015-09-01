var _ = require('lodash');
var typeRegistry = require('./typeRegistry');
// TODO: doc... this is unwrapJSONSafeObject by another name...
/**
 * TODO: Recursively converts the given json-safe object back to a normal value.
 * Throws an error if any part of the value cannot be converted.
 */
function rehydrate(jsonSafeObject, getSlowObjectDef) {
    // Some primitives need no special processing. Return them as-is.
    if (_.isString(jsonSafeObject) || _.isNumber(jsonSafeObject) || _.isBoolean(jsonSafeObject) || _.isNull(jsonSafeObject)) {
        return jsonSafeObject;
    }
    else if (jsonSafeObject && jsonSafeObject.$type === 'SlowRef') {
        return getSlowObjectDef(jsonSafeObject.value);
    }
    else if (jsonSafeObject && jsonSafeObject.$type === 'SlowDef') {
        var slow = _.mapValues(jsonSafeObject.value, function (propValue) { return rehydrate(propValue, getSlowObjectDef); });
        var rehydrateSlowObject = typeRegistry.fetch(slow.type).rehydrate;
        return rehydrateSlowObject(slow);
    }
    else if (_.isArray(jsonSafeObject)) {
        return jsonSafeObject.map(function (element) { return rehydrate(element, getSlowObjectDef); });
    }
    else if (_.isPlainObject(jsonSafeObject) && !('$type' in jsonSafeObject)) {
        return _.mapValues(jsonSafeObject, function (propValue) { return rehydrate(propValue, getSlowObjectDef); });
    }
    else if (jsonSafeObject && jsonSafeObject.$type === 'undefined') {
        return void 0;
    }
    else if (jsonSafeObject && jsonSafeObject.$type === 'function') {
        return eval('(' + jsonSafeObject.value + ')');
    }
    else if (jsonSafeObject && jsonSafeObject.$type === 'error') {
        return new Error(jsonSafeObject.value);
    }
    // If we get to here, the value is not recognised. Throw an error.
    throw new Error("rehydration not supported for value: " + jsonSafeObject);
}
module.exports = rehydrate;
//# sourceMappingURL=rehydrate.js.map