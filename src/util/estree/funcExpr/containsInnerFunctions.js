var traverseTree = require('../traverseTree');
/** Traverses the AST, checking for inner functions/lambdas. */
function containsInnerFunctions(funcExpr) {
    var result = false;
    traverseTree(funcExpr.body, function (node) {
        if (result)
            return false;
        switch (node.type) {
            case 'FunctionDeclaration':
            case 'FunctionExpression':
            case 'ArrowFunctionExpression':
                result = true;
        }
    });
    return result;
}
module.exports = containsInnerFunctions;
//# sourceMappingURL=containsInnerFunctions.js.map