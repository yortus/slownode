import matchNode = require('../matchNode');
import traverseTree = require('../traverseTree');
import classifyIdentifiers = require('./classifyIdentifiers');
export = ensureAllIdentifierReferencesAreKnownLocalsOrAmbients;


/** Traverses the AST, throwing an error if an unqualified identifier name is neither a local nor an ambient variable name. */
function ensureAllIdentifierReferencesAreKnownLocalsOrAmbients(funcExpr: ESTree.FunctionExpression) {

    // Collate all known identifiers, including ambients, locals, and catch block exception identifiers.
    var ids = classifyIdentifiers(funcExpr);
    var knownIds = [].concat(ids.global, ids.var, ids.const, ids.catch);

    // Ensure all identifier references are to known ids.
    traverseTree(funcExpr.body, node => {
        return matchNode<any>(node, {

            // Ignore the label identifier and continue checking the body.
            LabeledStatement: (stmt) => stmt.body,

            // Ignore the property identifier (if any) and continue checking the object.
            MemberExpression: (expr) => expr.computed ? void 0 : expr.object,

            // Ignore key identifiers (if any) but check everything else.
            ObjectExpression: (expr) => {
                var computedKeyExprs = expr.properties.filter(p => p.computed).map(p => p.key);
                var valueExprs = expr.properties.map(p => p.value);
                return { type: 'ArrayExpression', elements: computedKeyExprs.concat(valueExprs) };
            },

            Identifier: (expr) => {
                if (knownIds.indexOf(expr.name) !== -1) return;
                throw new Error(`Steppable: reference to unknown identifier '${expr.name}'`);
            },

            Otherwise: (node) => { /* pass-through */ }
        });
    });
}
