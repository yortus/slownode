import _ = require('lodash');
import matchNode = require('../matchNode');
import traverseTree = require('../traverseTree');
import classifyIdentifiers = require('./classifyIdentifiers');
export = isRelocatable;


// TODO: BUG: detect refs to 'this' within the body - they are definitely NOT relocatable


/**
 * Traverses the AST to determine whether the function is relocatable. A relocatable function is one
 * whose meaning remains the same after being converted to a string (via toString()) then converted
 * back to a function (via eval()). Constructs that prevent a function being relocatable are:
 * - references to free variables other than globals, `safeIds`, __dirname, __filename, or require.
 * - references to __dirname, __filename or require where the function's base location is unknown.
 * - nested functions that are not relocatable.
 * @param funcExpr the AST representing the function body.
 * @param safeIds closed-over identifiers that are known to be relocatable.
 * @param baseLocation absolute file system location of the function definition, if known.
 */
function isRelocatable(func: ESTree.Function, safeIds?: string[], baseLocation?: string): boolean {

    // Classify all identifiers referenced by the function.
    var ids = classifyIdentifiers(func);
    var moduleIds = _.difference(ids.module, safeIds || []);

    // Check for unconditionally non-relocatable constructs.
    if (_.difference(ids.scoped, safeIds || []).length > 0) return false;
    if (_.without(moduleIds, '__dirname', '__filename', 'require').length > 0) return false;

    // Check the conditionally relocatable constructs.
    if (_.intersection(moduleIds, '__dirname', '__filename', 'require').length > 0) {
        if (!baseLocation) return false;
    }

    // Recursively check nested function declarations/expressions.
    var foundNonRelocatableNestedFunction = false;
    traverseTree(func.body, node => {
        return matchNode<any>(node, {
            FunctionExpression: (expr) => {
                if (!isRelocatable(expr)) foundNonRelocatableNestedFunction = true;
                return false;
            },
            FunctionDeclaration: (decl) => {
                if (!isRelocatable(decl)) foundNonRelocatableNestedFunction = true;
                return false;
            },

            // For all other constructs, just continue traversing their children.
            Otherwise: (node) => { /* pass-through */ }
        });
    });

    // TODO: BUG? don't we need to check foundNonRelocatableNestedFunction here?

    // All checked. The function must be relocatable.
    return true;
}
