var matchNode = require('../matchNode');
var traverseTree = require('../traverseTree');
// TODO: BUG (corner case): A reference to a free (ie non-local) identifier with the same name
//       as a catch block exception indentifier will be identified as referring to that catch ID,
//       even if the reference appears outside the catch block, which is materially incorrect.
/**
 * Find all indentifiers referenced in the given function expression,
 * and classify them by scope. The results are memoized on the _id key.
 * NB: Duplicates are *not* removed.
 */
function classifyIdentifiers(funcExpr) {
    // Return the previously computed result, if available.
    if (funcExpr._ids)
        return funcExpr._ids;
    // Find all locally-declared IDs, and all locally-referenced IDs.
    var varIds = funcExpr.params.map(function (p) { return p['name']; });
    var letIds = [];
    var constIds = [];
    var catchIds = [];
    var refIds = [];
    traverseTree(funcExpr.body, function (node) {
        matchNode(node, {
            // Collect var/let/const IDs.
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
                return false;
            },
            // Collect catch block exception identifiers.
            TryStatement: function (stmt) {
                if (stmt.handler) {
                    catchIds.push(stmt.handler.param['name']);
                }
            },
            // Collect all referenced IDs, excluding labels and property names.
            LabeledStatement: function (stmt) { return stmt.body; },
            MemberExpression: function (expr) { return expr.computed ? void 0 : expr.object; },
            ObjectExpression: function (expr) {
                var computedKeyExprs = expr.properties.filter(function (p) { return p.computed; }).map(function (p) { return p.key; });
                var valueExprs = expr.properties.map(function (p) { return p.value; });
                return { type: 'ArrayExpression', elements: computedKeyExprs.concat(valueExprs) };
            },
            Identifier: function (expr) {
                refIds.push(expr.name);
            },
            // For all other constructs, just continue traversing their children.
            Otherwise: function (node) { }
        });
    });
    // Extract global and scoped IDs from the collected refIDs.
    var freeScopedIds = [];
    var freeGlobalIds = ['require']; // TODO: review!! require() is NOT global!
    var allLocalIds = [].concat(varIds, letIds, constIds, catchIds);
    refIds.forEach(function (refId) {
        if (allLocalIds.indexOf(refId) !== -1)
            return;
        (refId in global ? freeGlobalIds : freeScopedIds).push(refId);
    });
    // Memoize and return the classified identifiers.
    return funcExpr._ids = {
        var: varIds,
        let: letIds,
        const: constIds,
        catch: catchIds,
        freeScoped: freeScopedIds,
        freeGlobal: freeGlobalIds,
    };
}
module.exports = classifyIdentifiers;
//# sourceMappingURL=classifyIdentifiers.js.map