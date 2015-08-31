import matchNode = require('../matchNode');
import traverseTree = require('../traverseTree');
import classifyIdentifiers = require('./classifyIdentifiers');
export = ensureNodesAreLegalForSteppableBody;


/**
 * Traverses the AST, throwing an error if any unsupported constructs are encountered.
 * Constructs may be unsupported for two main reasons:
 * (1) they violate the assumptions on which Steppables depend, in particular the single-scoped-body assumption.
 * (2) they have not been implemented yet (destructuring, for..of, and some other ES6+ constructs). 
 */
function ensureNodesAreLegalForSteppableBody(funcExpr: ESTree.FunctionExpression) {

    // Rule out non-whitelisted node types.
    traverseTree(funcExpr.body, node => {
        var whitelisted = whitelistedNodeTypes.indexOf(node.type) !== -1;
        if (whitelisted) return;
        switch (node.type) {
            case 'FunctionDeclaration':
            case 'FunctionExpression':
            case 'ArrowFunctionExpression':
                throw new Error(`Steppable: function delcarations, function expressions and arrow functions are not allowed within the steppable body`);
            default:
                throw new Error(`Steppable: construct '${node.type}' is not allowed within the steppable body`);
        }
    });

    // Rule out block-scoped declarations (ie just 'let' declarations; 'const' declarations will be treated as ambients.
    var ids = classifyIdentifiers(funcExpr);
    if (ids.let.length > 0) throw new Error(`Steppable: block scoped variables are not allowed within the steppable body ('${ids.let.join("', '")}')`);

    // Rule out catch block exception identifiers that shadow or are shadowed by any other identifier.
    var nonCatchIds = [].concat(ids.var, ids.const, ids.freeGlobal);
    ids.catch.forEach((name, i) => {
        var otherCatchIds = [].concat(ids.catch.slice(0, i), ids.catch.slice(i + 1));
        if (nonCatchIds.indexOf(name) === -1 && otherCatchIds.indexOf(name) === -1) return;
        throw new Error(`Steppable: exception identifier '${name}' shadows or is shadowed by another local or ambient identifier`);
    });
}


var whitelistedNodeTypes = [
    'EmptyStatement', 'BlockStatement', 'ExpressionStatement', 'IfStatement', 'SwitchStatement',
    'WhileStatement', 'DoWhileStatement', 'ForStatement', 'ForInStatement', 'TryStatement',
    'LabeledStatement', 'BreakStatement', 'ContinueStatement', 'ReturnStatement', 'ThrowStatement',
    'VariableDeclaration', 'SequenceExpression', 'YieldExpression', 'AssignmentExpression', 'ConditionalExpression',
    'LogicalExpression', 'BinaryExpression', 'UnaryExpression', 'UpdateExpression', 'CallExpression',
    'NewExpression', 'MemberExpression', 'ArrayExpression', 'ObjectExpression', 'Identifier',
    'TemplateLiteral', 'RegexLiteral', 'Literal'
];
