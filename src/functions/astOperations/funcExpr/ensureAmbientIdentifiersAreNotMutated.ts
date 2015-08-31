import matchNode = require('../matchNode');
import traverseTree = require('../traverseTree');
import classifyIdentifiers = require('./classifyIdentifiers');
export = ensureAmbientIdentifiersAreNotMutated;


/** Traverses the AST, throwing an error if any construct mutates an ambient variable. */
function ensureAmbientIdentifiersAreNotMutated(funcExpr: ESTree.FunctionExpression) {

    // Collate all ambient identifiers, including globals and local consts.
    var ids = classifyIdentifiers(funcExpr);
    var ambientIds = [].concat(ids.freeGlobal, ids.const);

    // Ensure all references to ambient identifiers are non-mutating (at least not obviously so; this is not definitive).
    traverseTree(funcExpr.body, node => {
        return matchNode<any>(node, {

            AssignmentExpression: (expr) => {
                if (expr.left.type !== 'Identifier') return;
                var name = expr.left['name'];
                if (ambientIds.indexOf(name) === -1) return;
                throw new Error(`Steppable: cannot mutate ambient identifier '${name}'`);
            },

            UpdateExpression: (expr) => {
                if (expr.argument.type !== 'Identifier') return;
                var name = expr.argument['name'];
                if (ambientIds.indexOf(name) === -1) return;
                throw new Error(`Steppable: cannot mutate ambient identifier '${name}'`);
            },

            Otherwise: (node) => { /* pass-through */ }
        });
    });
}
