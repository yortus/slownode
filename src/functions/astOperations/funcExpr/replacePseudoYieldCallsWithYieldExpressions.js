var matchNode = require('../matchNode');
var traverseTree = require('../traverseTree');
/** In the given AST, converts direct calls to `pseudoYieldIdentifier` to equivalent yield expressions */
function replacePseudoYieldCallsWithYieldExpressions(funcExpr, pseudoYieldIdentifier) {
    traverseTree(funcExpr.body, function (node) {
        matchNode(node, {
            CallExpression: function (expr) {
                if (expr.callee.type !== 'Identifier')
                    return;
                if (expr.callee['name'] !== pseudoYieldIdentifier)
                    return;
                var args = expr.arguments;
                if (args.length > 1)
                    throw new Error("Steppable: yield accepts at most one argument; " + args.length + " supplied");
                // Replace the CallExpression with a YieldExpression.
                Object.keys(expr).forEach(function (key) { return delete expr[key]; });
                expr.type = 'YieldExpression';
                if (args.length === 1)
                    expr['argument'] = args[0];
            },
            Otherwise: function (node) { }
        });
    });
}
module.exports = replacePseudoYieldCallsWithYieldExpressions;
//# sourceMappingURL=replacePseudoYieldCallsWithYieldExpressions.js.map