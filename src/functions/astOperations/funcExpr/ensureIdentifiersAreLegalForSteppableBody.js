var matchNode = require('../matchNode');
var traverseTree = require('../traverseTree');
/** Traverses the AST and throws an error if an identifier is encountered that contains exotic characters or is called '$'. */
function ensureIdentifiersAreLegalForSteppableBody(funcExpr) {
    traverseTree(funcExpr.body, function (node) {
        return matchNode(node, {
            Identifier: function (expr) {
                if (/^(?!\$$)[a-zA-Z$_][a-zA-Z$_0-9]*$/.test(expr.name))
                    return;
                throw new Error("Steppable: invalid or disallowed identifier name '" + expr.name + "'");
            },
            Otherwise: function (node) { }
        });
    });
}
module.exports = ensureIdentifiersAreLegalForSteppableBody;
//# sourceMappingURL=ensureIdentifiersAreLegalForSteppableBody.js.map