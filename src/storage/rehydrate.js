var _ = require('lodash');
// TODO: doc... this is unwrapJSONSafeObject by another name...
/**
 * TODO: Recursively converts the given json-safe object back to a normal value.
 * Throws an error if any part of the value cannot be converted.
 */
function rehydrate(jsonSafeObject) {
    // Some primitives map to themselves. Return them as-is.
    if (_.isString(jsonSafeObject) || _.isNumber(jsonSafeObject) || _.isBoolean(jsonSafeObject) || _.isNull(jsonSafeObject)) {
        return jsonSafeObject;
    }
    else if (_.isArray(jsonSafeObject)) {
        return jsonSafeObject.map(rehydrate);
    }
    else if (jsonSafeObject && jsonSafeObject.$type === 'object') {
        return _.mapValues(jsonSafeObject.value, rehydrate);
    }
    else if (_.isPlainObject(jsonSafeObject) && !('$type' in jsonSafeObject)) {
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
    else
        return jsonSafeObject;
    // TODO: was...
    //// If we get to here, the value is not recognised. Throw an error.
    //throw new Error(`rehydration not supported for value: ${jsonSafeObject}`);
}
module.exports = rehydrate;
//# sourceMappingURL=rehydrate.js.map