import matchNode = require('../matchNode');
import traverseTree = require('../traverseTree');
export = ensureIdentifiersAreLegalForSteppableBody;


/** Traverses the AST and throws an error if an identifier is encountered that contains exotic characters or is called '$'. */
function ensureIdentifiersAreLegalForSteppableBody(funcExpr: ESTree.FunctionExpression) {
    traverseTree(funcExpr.body, node => {
        return matchNode<any>(node, {
            Identifier: (expr) => {
                if (/^(?!\$$)[a-zA-Z$_][a-zA-Z$_0-9]*$/.test(expr.name)) return;
                throw new Error(`Steppable: invalid or disallowed identifier name '${expr.name}'`);
            },
            Otherwise: (node) => { /* pass-through */ }
        });
    });
}
