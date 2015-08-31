import matchNode = require('../matchNode');
import traverseTree = require('../traverseTree');
export = classifyIdentifiers;


/**
 * Find and classify all indentifiers present in the given function expression.
 * The results are memoized on the _id key.
 * NB: Duplicates are *not* removed.
 */
function classifyIdentifiers(funcExpr: ESTree.FunctionExpression) {

    // Return the previously computed result, if available.
    if (funcExpr._ids) return funcExpr._ids;

    // Find and classify all identifiers.
    var globalIds = ['require'].concat(Object.getOwnPropertyNames(global));
    var varIds = funcExpr.params.map(p => <string> p['name']);
    var letIds: string[] = [];
    var constIds: string[] = [];
    var catchIds: string[] = [];
    traverseTree(funcExpr.body, node => {
        matchNode(node, {
            VariableDeclaration: (stmt) => {
                var ids = stmt.declarations.map(decl => decl.id['name']);
                switch (stmt.kind) {
                    case 'var': varIds = varIds.concat(ids); break;
                    case 'let': letIds = letIds.concat(ids); break;
                    case 'const': constIds = constIds.concat(ids); break;
                }
            },
            TryStatement: (stmt) => {
                if (stmt.handler) {
                    catchIds.push(stmt.handler.param['name']);
                }
            },
            Otherwise: (node) => { /* pass-through */ }
        });
    });

    // Memoize and return the classified identifiers.
    return funcExpr._ids = {
        global: globalIds,
        var: varIds,
        let: letIds,
        const: constIds,
        catch: catchIds
    };
}
