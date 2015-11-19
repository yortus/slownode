var matchNode = require('../matchNode');
var traverseTree = require('../traverseTree');
var isRelocatable = require('./isRelocatable');
/**
 * Traverses the AST and throws an error if a non-relocatable nested function is encountered.
 */
function ensureNestedFunctionsAreRelocatable(func) {
    traverseTree(func.body, function (node) {
        return matchNode(node, {
            FunctionExpression: function (expr) {
                if (!isRelocatable(expr))
                    throw new Error('Steppable: nested functions must be relocatable');
                return false;
            },
            FunctionDeclaration: function (decl) {
                if (!isRelocatable(decl))
                    throw new Error('Steppable: nested functions must be relocatable');
                return false;
            },
            // For all other constructs, just continue traversing their children.
            Otherwise: function (node) { }
        });
    });
}
module.exports = ensureNestedFunctionsAreRelocatable;
//# sourceMappingURL=ensureNestedFunctionsAreRelocatable.js.map