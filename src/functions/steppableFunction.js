var assert = require('assert');
var _ = require('lodash');
var esprima = require('esprima');
var escodegen = require('escodegen');
var matchNode = require('./astOperations/matchNode');
var traverseTree = require('./astOperations/traverseTree');
var replacePseudoYieldCallsWithYieldExpressions = require('./astOperations/funcExpr/replacePseudoYieldCallsWithYieldExpressions');
var replacePseudoConstCallsWithConstDeclarations = require('./astOperations/funcExpr/replacePseudoConstCallsWithConstDeclarations');
var transformToStateMachine = require('./astOperations/funcExpr/transformToStateMachine');
var Steppable = require('./steppable');
// TODO: another valid 'local' identifier is the function's own name
// TODO: disallow id refs to: '__dirname', '__filename', 'module'
// TODO: support yield*?
//---------------------------------------------
// TODO: doc all this in README...
// Rules for Steppable bodies:
// - ensure the assumption of a *single* scope for identifiers within the function body is strictly met:
//   - ensure function contains no closures (ie inner functions or lambdas)
//   - ensure exception identifier names in catch blocks are disjoint with all other identifier names in the function
//     - note: these ids are scoped only to the catch block. This check allows them to be treated like all other local vars
//   - ensure all variable declarations are 'var' (ie not 'let' or 'const' except as per below rules)
//
// - ensure the function is a pure function of it inputs:
//   - all identifiers referenced are either:
//     - parameters of the function
//     - locally declared variables or labels
//     - whitelisted globals and 'ambients' ('arguments', 'require', 'Infinity', 'parseInt', what else...?)
//     - locally declared 'const' identifiers whose rhs is considered 'safe and idempotent' (as in the HTTP-method sense)
//       - TODO: rules for 'safe and idempotent'...
// NB: no need to check for syntactic validity, since the function must be syntactically valid to have been passed in here.
// NB: either a normal function or generator function can be passed in - it makes no difference (doc why to do this (hint: yield keyword available in gens))
//---------------------------------------------
/** Creates a SteppableFunction instance. May be called with or without 'new'. */
function SteppableFunction(bodyFunction, options) {
    // Validate arguments.
    assert(typeof bodyFunction === 'function');
    options = _.defaults({}, options, { yieldIdentifier: null, constIdentifier: null });
    // Transform original function --> source code --> AST.
    var originalFunction = bodyFunction;
    var originalSource = '(' + originalFunction.toString() + ')';
    var originalAST = esprima.parse(originalSource);
    var exprStmt = originalAST.body[0];
    var funcExpr = exprStmt.expression;
    // Convert direct calls to options.yieldIdentifier to equivalent yield expressions.
    if (options.yieldIdentifier)
        replacePseudoYieldCallsWithYieldExpressions(funcExpr, options.yieldIdentifier);
    // Convert variable declarations whose 'init' is a direct call to options.constIdentifier to equivalent const declarations.
    if (options.constIdentifier)
        replacePseudoConstCallsWithConstDeclarations(funcExpr, options.constIdentifier);
    // Validate the AST.
    ensureOnlySupportedConstructsInBody(funcExpr);
    ensureIdentifierNamesAreValid(funcExpr);
    ensureAllIdentifierReferencesAreKnownLocalsOrAmbients(funcExpr);
    ensureAmbientIdentifiersAreNotMutated(funcExpr);
    // Rewrite the AST in a form suitable for serialization/deserialization.
    var stateMachineAST = transformToStateMachine(funcExpr);
    // Transform modified AST --> source code --> function.
    var stateMachineSource = '(' + escodegen.generate(stateMachineAST) + ')';
    var stateMachine = eval(stateMachineSource);
    // Generate and return a SteppableFunction instance (ie a callable that returns a Steppable).
    assert(funcExpr.params.every(function (p) { return p.type === 'Identifier'; }));
    var paramNames = funcExpr.params.map(function (p) { return p['name']; });
    var result = makeSteppableFunction(stateMachine, paramNames);
    return result;
}
/** Returns all global and local identifiers broken down into categories. Duplicates are not removed. */
function findAllIdentifiers(funcExpr) {
    var globalIds = ['require'].concat(Object.getOwnPropertyNames(global));
    var varIds = funcExpr.params.map(function (p) { return p['name']; });
    var letIds = [];
    var constIds = [];
    var catchIds = [];
    traverseTree(funcExpr.body, function (node) {
        matchNode(node, {
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
            },
            TryStatement: function (stmt) {
                if (stmt.handler) {
                    catchIds.push(stmt.handler.param['name']);
                }
            },
            Otherwise: function (node) { }
        });
    });
    return {
        global: globalIds,
        var: varIds,
        let: letIds,
        const: constIds,
        catch: catchIds
    };
}
/**
 * Traverses the AST, throwing an error if any unsupported constructs are encountered.
 * Constructs may be unsupported for two main reasons:
 * (1) they violate the assumptions on which Steppables depend, in particular the single-scoped-body assumption.
 * (2) they have not been implemented yet (destructuring, for..of, and some other ES6+ constructs).
 */
function ensureOnlySupportedConstructsInBody(funcExpr) {
    var whitelistedNodeTypes = [
        'EmptyStatement', 'BlockStatement', 'ExpressionStatement', 'IfStatement', 'SwitchStatement',
        'WhileStatement', 'DoWhileStatement', 'ForStatement', 'ForInStatement', 'TryStatement',
        'LabeledStatement', 'BreakStatement', 'ContinueStatement', 'ReturnStatement', 'ThrowStatement',
        'VariableDeclaration', 'SequenceExpression', 'YieldExpression', 'AssignmentExpression', 'ConditionalExpression',
        'LogicalExpression', 'BinaryExpression', 'UnaryExpression', 'UpdateExpression', 'CallExpression',
        'NewExpression', 'MemberExpression', 'ArrayExpression', 'ObjectExpression', 'Identifier',
        'TemplateLiteral', 'RegexLiteral', 'Literal'
    ];
    // Rule out non-whitelisted node types.
    traverseTree(funcExpr.body, function (node) {
        var whitelisted = whitelistedNodeTypes.indexOf(node.type) !== -1;
        if (whitelisted)
            return;
        switch (node.type) {
            case 'FunctionDeclaration':
            case 'FunctionExpression':
            case 'ArrowFunctionExpression':
                throw new Error("Steppable: function delcarations, function expressions and arrow functions are not allowed within the body function");
            default:
                throw new Error("Steppable: construct '" + node.type + "' is not allowed within the body function");
        }
    });
    // Rule out block-scoped declarations (ie just 'let' declarations; 'const' declarations will be treated as ambients.
    var ids = findAllIdentifiers(funcExpr);
    if (ids.let.length > 0)
        throw new Error("Steppable: block scoped variables are not allowed within the body function ('" + ids.let.join("', '") + "')");
    // Rule out catch block exception identifiers that shadow or are shadowed by any other identifier.
    var nonCatchIds = [].concat(ids.var, ids.const, ids.global);
    ids.catch.forEach(function (name, i) {
        var otherCatchIds = [].concat(ids.catch.slice(0, i), ids.catch.slice(i + 1));
        if (nonCatchIds.indexOf(name) === -1 && otherCatchIds.indexOf(name) === -1)
            return;
        throw new Error("Steppable: exception identifier '" + name + "' shadows or is shadowed by another local or ambient identifier");
    });
}
/** Traverses the AST and throws an error if an identifier is encountered that contains exotic characters or is called '$' or '$ambient'. */
function ensureIdentifierNamesAreValid(funcExpr) {
    traverseTree(funcExpr.body, function (node) {
        return matchNode(node, {
            Identifier: function (expr) {
                if (expr.name !== '$' && expr.name !== '$ambient' && /^[a-zA-Z$_][a-zA-Z$_0-9]*$/.test(expr.name))
                    return;
                throw new Error("Steppable: invalid or disallowed identifier name '" + expr.name + "'");
            },
            Otherwise: function (node) { }
        });
    });
}
/** Traverses the AST, throwing an error if an unqualified identifier name is neither a local nor an ambient variable name. */
function ensureAllIdentifierReferencesAreKnownLocalsOrAmbients(funcExpr) {
    // Collate all known identifiers, including ambients, locals, and catch block exception identifiers.
    var ids = findAllIdentifiers(funcExpr);
    var knownIds = [].concat(ids.global, ids.var, ids.const, ids.catch);
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
/** Traverses the AST, throwing an error if any construct mutates an ambient variable. */
function ensureAmbientIdentifiersAreNotMutated(funcExpr) {
    // Collate all ambient identifiers, including globals and local consts.
    var ids = findAllIdentifiers(funcExpr);
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
/** Constructs a SteppableFunction instance tailored to the given StateMachine function and parameter names. */
function makeSteppableFunction(stateMachine, paramNames) {
    // This is the generic constructor function. It closes over stateMachine.
    function SteppableFunction() {
        var steppable = new Steppable(stateMachine);
        steppable.state = { local: { arguments: Array.prototype.slice.call(arguments) } };
        return steppable;
    }
    // Customise the generic constructor function with the specified parameter names and a `stateMachine` property.
    var originalSource = SteppableFunction.toString();
    var sourceWithParamNames = originalSource.replace('SteppableFunction()', "SteppableFunction(" + paramNames.join(', ') + ")");
    var constructorFunction = eval('(' + sourceWithParamNames + ')');
    // Add the `stateMachine` property to the constructor function.
    constructorFunction.stateMachine = stateMachine;
    // Return the customised constructor function.
    return constructorFunction;
}
module.exports = SteppableFunction;
//# sourceMappingURL=steppableFunction.js.map