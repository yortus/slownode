var assert = require('assert');
var _ = require('lodash');
var isRelocatableFunction = require('../util/isRelocatableFunction');
/**
 * Recursively converts the given slow object into an object that can be safely converted to JSON.
 * Throws an error if any part of the value cannot be converted.
 */
function dehydrateSlowObject(slowObj, allSlowObjects) {
    // TODO: temp testing...
    if (!allSlowObjects.has(slowObj)) {
        // Should never get here. This matches the assertion below, but allows debugging. Remove this when solid.
        debugger;
    }
    assert(allSlowObjects.has(slowObj));
    return _.mapValues(slowObj.$slow, function (v) { return dehydrate(v, allSlowObjects); });
}
/**
 * Recursively converts the given value into an object that can be safely converted to JSON.
 * Throws an error if any part of the value cannot be converted.
 */
function dehydrate(value, allSlowObjects) {
    // Some primitives map to themselves. Return them as-is.
    if (_.isString(value) || _.isNumber(value) || _.isBoolean(value) || _.isNull(value)) {
        return value;
    }
    else if (allSlowObjects.has(value)) {
        return { $ref: value.$slow.id };
    }
    else if (_.isArray(value)) {
        return value.map(function (v) { return dehydrate(v, allSlowObjects); });
    }
    else if (_.isPlainObject(value)) {
        return { $type: 'object', value: _.pairs(value).map(function (pair) { return [pair[0], dehydrate(pair[1], allSlowObjects)]; }) };
    }
    else if (_.isUndefined(value)) {
        return { $type: 'undefined' };
    }
    else if (_.isFunction(value)) {
        if (isRelocatableFunction(value))
            return { $type: 'function', value: value.toString() };
        throw new Error("dehydration not supported for non-relocatable function: " + value);
    }
    else if (value && value.constructor === Error) {
        return { $type: 'error', value: value.message };
    }
    // If we get to here, the value is not recognised. Throw an error.
    throw new Error("dehydration not supported for value : " + value);
}
module.exports = dehydrateSlowObject;
//# sourceMappingURL=dehydrateSlowObject.js.map