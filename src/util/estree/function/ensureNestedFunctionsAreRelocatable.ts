import _ = require('lodash');
import matchNode = require('../matchNode');
import traverseTree = require('../traverseTree');
import isRelocatable = require('./isRelocatable');
export = ensureNestedFunctionsAreRelocatable;


/**
 * Traverses the AST and throws an error if a non-relocatable nested function is encountered.
 */
function ensureNestedFunctionsAreRelocatable(func: ESTree.Function) {

    traverseTree(func.body, node => {
        return matchNode<any>(node, {
            FunctionExpression: (expr) => {
                if (!isRelocatable(expr)) throw new Error('Steppable: nested functions must be relocatable');
                return false;
            },
            FunctionDeclaration: (decl) => {
                if (!isRelocatable(decl)) throw new Error('Steppable: nested functions must be relocatable');
                return false;
            },

            // For all other constructs, just continue traversing their children.
            Otherwise: (node) => { /* pass-through */ }
        });
    });
}
