var traverseTree = require('../traverseTree');
var classifyIdentifiers = require('./classifyIdentifiers');
// TODO: here might be a good place to rule out local decls that shadow global/module decls,
//       and function decls/exprs whose name is same as a local/global/module
/**
 * Traverses the AST, throwing an error if any unsupported constructs are encountered.
 * Constructs may be unsupported for two main reasons:
 * (1) they violate the assumptions on which Steppables depend, in particular the single-scoped-body assumption.
 * (2) they have not been implemented yet (destructuring, for..of, and some other ES6+ constructs).
 */
function ensureNodesAreLegalForSteppableBody(func) {
    // Classify all identifiers referenced by the function.
    var ids = classifyIdentifiers(func);
    // Rule out non-whitelisted node types.
    traverseTree(func.body, function (node) {
        var whitelisted = whitelistedNodeTypes.indexOf(node.type) !== -1;
        if (!whitelisted)
            throw new Error("Steppable: construct '" + node.type + "' is not allowed within the steppable body");
    });
    // Rule out block-scoped declarations (ie just 'let' declarations; 'const' declarations will be treated as ambients.
    if (ids.local.let.length > 0)
        throw new Error("Steppable: block scoped variables are not allowed within the steppable body ('" + ids.local.let.join("', '") + "')");
    // Rule out catch block exception identifiers that shadow or are shadowed by any other identifier.
    var nonCatchIds = [].concat(ids.local.var, ids.local.const, ids.module, ids.global);
    ids.local.catch.forEach(function (name, i) {
        var otherCatchIds = [].concat(ids.local.catch.slice(0, i), ids.local.catch.slice(i + 1));
        if (nonCatchIds.indexOf(name) === -1 && otherCatchIds.indexOf(name) === -1)
            return;
        throw new Error("Steppable: exception identifier '" + name + "' shadows or is shadowed by another local or ambient identifier");
    });
}
var whitelistedNodeTypes = [
    'EmptyStatement', 'BlockStatement', 'ExpressionStatement', 'IfStatement', 'SwitchStatement',
    'WhileStatement', 'DoWhileStatement', 'ForStatement', 'ForInStatement', 'TryStatement',
    'LabeledStatement', 'BreakStatement', 'ContinueStatement', 'ReturnStatement', 'ThrowStatement',
    'VariableDeclaration', 'SequenceExpression', 'YieldExpression', 'AssignmentExpression', 'ConditionalExpression',
    'LogicalExpression', 'BinaryExpression', 'UnaryExpression', 'UpdateExpression', 'CallExpression',
    'NewExpression', 'MemberExpression', 'ArrayExpression', 'ObjectExpression', 'Identifier',
    'TemplateLiteral', 'RegexLiteral', 'Literal', 'FunctionDeclaration', 'FunctionExpression'
];
module.exports = ensureNodesAreLegalForSteppableBody;
//# sourceMappingURL=ensureNodesAreLegalForSteppableBody.js.map