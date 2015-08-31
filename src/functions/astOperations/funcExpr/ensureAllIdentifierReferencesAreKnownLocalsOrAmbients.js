var matchNode = require('../matchNode');
var traverseTree = require('../traverseTree');
var classifyIdentifiers = require('./classifyIdentifiers');
// TODO: this needs review in light of changed functionality of classifyIdentifiers(...)
/** Traverses the AST, throwing an error if an unqualified identifier name is neither a local nor an ambient variable name. */
function ensureAllIdentifierReferencesAreKnownLocalsOrAmbients(funcExpr) {
    // Collate all known identifiers, including ambients, locals, and catch block exception identifiers.
    var ids = classifyIdentifiers(funcExpr);
    var knownIds = [].concat(ids.freeGlobal, ids.var, ids.const, ids.catch);
    // Ensure all identifier references are to known ids.
    traverseTree(funcExpr.body, function (node) {
        return matchNode(node, {
            // Ignore the label identifier and continue checking the body.
            LabeledStatement: function (stmt) { return stmt.body; },
            // Ignore the property identifier (if any) and continue checking the object.
            MemberExpression: function (expr) { return expr.computed ? void 0 : expr.object; },
            // Ignore key identifiers (if any) but check everything else.
            ObjectExpression: function (expr) {
                var computedKeyExprs = expr.properties.filter(function (p) { return p.computed; }).map(function (p) { return p.key; });
                var valueExprs = expr.properties.map(function (p) { return p.value; });
                return { type: 'ArrayExpression', elements: computedKeyExprs.concat(valueExprs) };
            },
            Identifier: function (expr) {
                if (knownIds.indexOf(expr.name) !== -1)
                    return;
                throw new Error("Steppable: reference to unknown identifier '" + expr.name + "'");
            },
            Otherwise: function (node) { }
        });
    });
}
module.exports = ensureAllIdentifierReferencesAreKnownLocalsOrAmbients;
//# sourceMappingURL=ensureAllIdentifierReferencesAreKnownLocalsOrAmbients.js.map