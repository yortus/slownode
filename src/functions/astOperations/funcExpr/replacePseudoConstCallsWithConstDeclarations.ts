import matchNode = require('../matchNode');
import traverseTree = require('../traverseTree');
export = replacePseudoConstCallsWithConstDeclarations;




/** In the given AST, converts variable declarations whose 'init' is a direct call to `pseudoConstIdentifier` to equivalent const declarations. */
function replacePseudoConstCallsWithConstDeclarations(funcExpr: ESTree.FunctionExpression, pseudoConstIdentifier: string) {
    traverseTree(funcExpr.body, node => {
        matchNode(node, {
            VariableDeclaration: (stmt) => {
                if (stmt.kind !== 'var') return;
                var constDeclarators = stmt.declarations.filter(isConstMarkedDeclarator);
                if (constDeclarators.length > 0 && constDeclarators.length < stmt.declarations.length) {
                    throw new Error('Steppable: cannot mix const and var declarators in a single declaration');
                }
                if (constDeclarators.length > 0) {
                    stmt.kind = 'const';
                    stmt.declarations.forEach(decl => decl.init = decl.init['arguments'][0]);
                }
            },
            Otherwise: (node) => { /* pass-through */ }
        });
    });

    function isConstMarkedDeclarator(decl: ESTree.VariableDeclarator) {
        if (!decl.init || decl.init.type !== 'CallExpression') return false;
        var callExpr = <ESTree.CallExpression> decl.init;
        if (callExpr.callee.type !== 'Identifier') return false;
        if (callExpr.callee['name'] !== pseudoConstIdentifier) return false;
        var args = callExpr.arguments;
        if (args.length > 1) throw new Error(`Steppable: ${pseudoConstIdentifier} must have one argument; ${args.length} supplied`);
        return true;
    }
}
