var matchNode = require('../matchNode');
var traverseTree = require('../traverseTree');
/**
 * Find and classify all indentifiers present in the given function expression.
 * The results are memoized on the _id key.
 * NB: Duplicates are *not* removed.
 */
function classifyIdentifiers(funcExpr) {
    // Return the previously computed result, if available.
    if (funcExpr._ids)
        return funcExpr._ids;
    // Find and classify all identifiers.
    var globalIds = ['require'].concat(Object.getOwnPropertyNames(global));
    var varIds = funcExpr.params.map(function (p) { return p['name']; });
    var letIds = [];
    var constIds = [];
    var catchIds = [];
    traverseTree(funcExpr.body, function (node) {
        matchNode(node, {
            VariableDeclaration: function (stmt) {
                var ids = stmt.declarations.map(function (decl) { return decl.id['name']; });
                switch (stmt.kind) {
                    case 'var':
                        varIds = varIds.concat(ids);
                        break;
                    case 'let':
                        letIds = letIds.concat(ids);
                        break;
                    case 'const':
                        constIds = constIds.concat(ids);
                        break;
                }
            },
            TryStatement: function (stmt) {
                if (stmt.handler) {
                    catchIds.push(stmt.handler.param['name']);
                }
            },
            Otherwise: function (node) { }
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
module.exports = classifyIdentifiers;
//# sourceMappingURL=classifyIdentifiers.js.map