var assert = require('assert');
var _ = require('lodash');
/**
 * TODO: Recursively converts the given dehydrated slow object back to a normal slow object.
 * Throws an error if any part of the value cannot be converted.
 */
function rehydrateSlowObject(dehydrated, allSlowObjects, factories) {
    // Rehydrate all the constituent parts in-place.
    var $slow = dehydrated.$slow;
    _.mapValues(dehydrated.$slow, function (val, key, obj) { return rehydrateInPlace(val, key, obj, allSlowObjects); });
    // Rehydrate the slow object using the appropriate factory function.
    var factory = factories[$slow.type];
    assert(factory);
    var rehydratedSlowObject = factory($slow);
    return rehydratedSlowObject;
}
/**
 * TODO: Recursively converts the given json-safe value back to a normal value.
 * Throws an error if any part of the value cannot be converted.
 */
function rehydrateInPlace(val, key, obj, allSlowObjects) {
    // Some primitives map to themselves. Return them as-is.
    if (_.isString(val) || _.isNumber(val) || _.isBoolean(val) || _.isNull(val)) {
    }
    else if (val && val.$ref) {
        var $ref = val.$ref;
        delete obj[key]; // TODO: needed? test...
        Object.defineProperty(obj, key, { get: function () { return allSlowObjects[$ref]; }, configurable: true, enumerable: true });
    }
    else if (_.isArray(val)) {
        val.forEach(function (elem, index) { return rehydrateInPlace(elem, index, val, allSlowObjects); });
    }
    else if (val && val.$type === 'object') {
        var pairs = val.value;
        val = obj[key] = _.zipObject(pairs);
        _.forEach(val, function (propValue, propName) { return rehydrateInPlace(propValue, propName, val, allSlowObjects); });
    }
    else if (val && val.$type === 'undefined') {
        obj[key] = void 0;
    }
    else if (val && val.$type === 'function') {
        obj[key] = eval('(' + val.value + ')');
    }
    else if (val && val.$type === 'error') {
        obj[key] = new Error(val.value);
    }
    else {
        throw new Error("rehydration not supported for value: " + val);
    }
}
module.exports = rehydrateSlowObject;
//# sourceMappingURL=rehydrateSlowObject.js.map