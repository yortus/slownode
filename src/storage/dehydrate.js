var _ = require('lodash');
var typeRegistry = require('./typeRegistry');
var isRelocatableFunction = require('../functions/isRelocatableFunction');
/**
 * Recursively converts the given value into an object that can be safely converted to JSON.
 * Throws an error if any part of the value cannot be converted.
 */
function dehydrate(value, treatSlowObjectsAsRefs) {
    if (treatSlowObjectsAsRefs === void 0) { treatSlowObjectsAsRefs = false; }
    // Some primitives are already safe. Return them unchanged.
    if (_.isString(value) || _.isNumber(value) || _.isBoolean(value) || _.isNull(value)) {
        return value;
    }
    else if (_.isObject(value) && _.has(value, '_slow')) {
        if (treatSlowObjectsAsRefs) {
            return {
                $type: 'SlowRef',
                value: _.pick(value._slow, ['type', 'id'])
            };
        }
        else {
            var slow = value._slow;
            var dehydrateSlowObject = typeRegistry.fetch(slow.type).dehydrate;
            dehydrateSlowObject = dehydrateSlowObject || (function (obj) { return _.mapValues(obj._slow, function (propValue) { return dehydrate(propValue, true); }); });
            return { $type: 'SlowDef', value: dehydrateSlowObject(value) };
        }
    }
    else if (_.isArray(value)) {
        return value.map(function (elem) { return dehydrate(elem, treatSlowObjectsAsRefs); });
    }
    else if (_.isPlainObject(value) && !_.has(value, '_slow')) {
        return _.mapValues(value, function (propValue) { return dehydrate(propValue, treatSlowObjectsAsRefs); });
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
    // TODO: temp testing... remove this...
    //else {
    //    return { $type: 'ERROR - UNKNOWN?!' };
    //}
    // If we get to here, the value is not recognised. Throw an error.
    throw new Error("dehydration not supported for value : " + value);
}
module.exports = dehydrate;
//# sourceMappingURL=dehydrate.js.map