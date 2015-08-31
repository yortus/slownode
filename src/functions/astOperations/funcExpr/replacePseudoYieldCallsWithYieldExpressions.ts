import matchNode = require('../matchNode');
import traverseTree = require('../traverseTree');
export = replacePseudoYieldCallsWithYieldExpressions;


/** In the given AST, converts direct calls to `pseudoYieldIdentifier` to equivalent yield expressions */
function replacePseudoYieldCallsWithYieldExpressions(funcExpr: ESTree.FunctionExpression, pseudoYieldIdentifier: string) {
    traverseTree(funcExpr.body, node => {
        matchNode(node, {
            CallExpression: (expr) => {
                if (expr.callee.type !== 'Identifier') return;
                if (expr.callee['name'] !== pseudoYieldIdentifier) return;
                var args = expr.arguments;
                if (args.length > 1) throw new Error(`Steppable: yield accepts at most one argument; ${args.length} supplied`);

                // Replace the CallExpression with a YieldExpression.
                Object.keys(expr).forEach(key => delete expr[key]);
                expr.type = 'YieldExpression';
                if (args.length === 1) expr['argument'] = args[0];
            },

            Otherwise: (node) => { /* pass-through */ }
        });
    });
}
