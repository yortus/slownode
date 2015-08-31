var matchNode = require('../matchNode');
var traverseTree = require('../traverseTree');
var classifyIdentifiers = require('./classifyIdentifiers');
/** Traverses the AST, throwing an error if any construct mutates an ambient variable. */
function ensureAmbientIdentifiersAreNotMutated(funcExpr) {
    // Collate all ambient identifiers, including globals and local consts.
    var ids = classifyIdentifiers(funcExpr);
    var ambientIds = [].concat(ids.global, ids.const);
    // Ensure all references to ambient identifiers are non-mutating (at least not obviously so; this is not definitive).
    traverseTree(funcExpr.body, function (node) {
        return matchNode(node, {
            AssignmentExpression: function (expr) {
                if (expr.left.type !== 'Identifier')
                    return;
                var name = expr.left['name'];
                if (ambientIds.indexOf(name) === -1)
                    return;
                throw new Error("Steppable: cannot mutate ambient identifier '" + name + "'");
            },
            UpdateExpression: function (expr) {
                if (expr.argument.type !== 'Identifier')
                    return;
                var name = expr.argument['name'];
                if (ambientIds.indexOf(name) === -1)
                    return;
                throw new Error("Steppable: cannot mutate ambient identifier '" + name + "'");
            },
            Otherwise: function (node) { }
        });
    });
}
module.exports = ensureAmbientIdentifiersAreNotMutated;
//# sourceMappingURL=ensureAmbientIdentifiersAreNotMutated.js.map