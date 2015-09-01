import _ = require('lodash');
import matchNode = require('../matchNode');
import traverseTree = require('../traverseTree');
import classifyIdentifiers = require('./classifyIdentifiers');
export = isRelocatable;


/**
 * Traverses the AST to determine whether the function is relocatable. A relocatable function is one
 * whose meaning remains the same after being converted to a string (via toString()) then converted
 * back to a function (via eval()). Constructs that prevent a function being relocatable are:
 * - references to free variables other than globals, __dirname, __filename or require.
 * - references to __dirname, __filename or require where the function's base location is unknown.
 */
function isRelocatable(funcExpr: ESTree.FunctionExpression, baseLocation?: string): boolean {

    // Classify all identifiers referenced by the function.
    var ids = classifyIdentifiers(funcExpr);

    // Check for unconditionally non-relocatable constructs.
    if (ids.scoped.length > 0) return false;
    if (_.without(ids.module, '__dirname', '__filename', 'require').length > 0) return false;

    // Check the conditionally relocatable constructs.
    if (_.intersection(ids.module, '__dirname', '__filename', 'require').length > 0) {
        if (!baseLocation) return false;
    }

    // All checked. The function must be relocatable.
    return true;
}
