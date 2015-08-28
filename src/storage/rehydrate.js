var _ = require('lodash');
// TODO: doc... this is unwrapJSONSafeObject by another name...
/**
 * TODO: Recursively converts the given json-safe object back to a normal value.
 * Throws an error if any part of the value cannot be converted.
 */
function rehydrate(jsonSafeObject) {
    // Some primitives need no special processing. Return them as-is.
    if (_.isString(jsonSafeObject) || _.isNumber(jsonSafeObject) || _.isBoolean(jsonSafeObject) || _.isNull(jsonSafeObject)) {
        return jsonSafeObject;
    }
    else if (_.isArray(jsonSafeObject)) {
        return jsonSafeObject.map(rehydrate);
    }
    else if (_.isPlainObject(jsonSafeObject) && !('$type' in jsonSafeObject)) {
        return _.mapValues(jsonSafeObject, rehydrate);
    }
    else if (jsonSafeObject && jsonSafeObject.$type === 'undefined') {
        return void 0;
    }
    else if (jsonSafeObject && jsonSafeObject.$type === 'SlowRef') {
        // TODO: ...
        return null;
        throw 'Not implemented';
    }
    else if (jsonSafeObject && jsonSafeObject.$type === 'SlowDef') {
        // TODO: ...
        return null;
        throw 'Not implemented';
        var slow = _.mapValues(jsonSafeObject.value, rehydrate);
    }
    // If we get to here, the value is not recognised. Throw an error.
    throw new Error("rehydration not supported for value: " + jsonSafeObject);
}
module.exports = rehydrate;
//# sourceMappingURL=rehydrate.js.map