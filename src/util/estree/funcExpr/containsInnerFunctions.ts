import traverseTree = require('../traverseTree');
import classifyIdentifiers = require('./classifyIdentifiers');
export = containsInnerFunctions;


/** Traverses the AST, checking for inner functions/lambdas. */
function containsInnerFunctions(funcExpr: ESTree.FunctionExpression) {
    var result = false;
    traverseTree(funcExpr.body, node => {
        if (result) return false;
        switch (node.type) {
            case 'FunctionDeclaration':
            case 'FunctionExpression':
            case 'ArrowFunctionExpression':
                result = true;
        }
    });
    return result;
}
