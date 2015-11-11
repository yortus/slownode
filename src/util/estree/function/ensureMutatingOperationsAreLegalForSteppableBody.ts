import matchNode = require('../matchNode');
import traverseTree = require('../traverseTree');
import classifyIdentifiers = require('./classifyIdentifiers');
export = ensureMutatingOperationsAreLegalForSteppableBody;


/** Traverses the AST, throwing an error if any construct mutates a const/module/global variable. */
function ensureMutatingOperationsAreLegalForSteppableBody(func: ESTree.Function) {

    // Get the names of all const/module/global variables referenced by the function.
    var ids = classifyIdentifiers(func);
    var nonMutableNames = [].concat(ids.local.const, ids.module, ids.global);

    // Ensure all references to const/module/global vars are non-mutating.
    // TODO: ...at least not obviously so; this is not definitive.
    traverseTree(func.body, node => {
        return matchNode<any>(node, {

            AssignmentExpression: (expr) => {
                if (expr.left.type !== 'Identifier') return;
                var name = expr.left['name'];
                if (nonMutableNames.indexOf(name) === -1) return;
                throw new Error(`Steppable: mutation not permitted for identifier '${name}'`);
            },

            UpdateExpression: (expr) => {
                if (expr.argument.type !== 'Identifier') return;
                var name = expr.argument['name'];
                if (nonMutableNames.indexOf(name) === -1) return;
                throw new Error(`Steppable: mutation not permitted for identifier '${name}'`);
            },

            Otherwise: (node) => { /* pass-through */ }
        });
    });
}
