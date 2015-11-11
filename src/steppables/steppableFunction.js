var assert = require('assert');
var esprima = require('esprima');
var escodegen = require('escodegen');
var makeCallableClass = require('../util/makeCallableClass');
var SteppableObject = require('./steppableObject');
var replacePseudoYieldCallsWithYieldExpressions = require('../util/estree/function/replacePseudoYieldCallsWithYieldExpressions');
var replacePseudoConstCallsWithConstDeclarations = require('../util/estree/function/replacePseudoConstCallsWithConstDeclarations');
var ensureNodesAreLegalForSteppableBody = require('../util/estree/function/ensureNodesAreLegalForSteppableBody');
var ensureIdentifiersAreLegalForSteppableBody = require('../util/estree/function/ensureIdentifiersAreLegalForSteppableBody');
var ensureMutatingOperationsAreLegalForSteppableBody = require('../util/estree/function/ensureMutatingOperationsAreLegalForSteppableBody');
var ensureNestedFunctionsAreRelocatable = require('../util/estree/function/ensureNestedFunctionsAreRelocatable');
var transformToStateMachine = require('../util/estree/function/transformToStateMachine');
// TODO: what about refs to 'this' within the body?
// TODO: memoize results (use shasum and cache)
// TODO: another valid 'local' identifier is the function's own name
// TODO: disallow id refs to: '__dirname', '__filename', 'module', 'exports'
// TODO: require() and its argument need special handling...
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
// TODO: can local variables shadow globals/ambients/specials? like require, __const, etc?
// NB: no need to check for general syntactic validity, since the function must be syntactically valid to have been passed in here.
// NB: either a normal function or generator function can be passed in - it makes no difference (doc why to do this (hint: yield keyword available in gens))
//---------------------------------------------
/**
 * Creates a SteppableFunction instance, calls to which return a SteppableObject instance.
 * A steppable function is analogous to an ES6 generator function.
 */
var SteppableFunction;
// Create a constructor function whose instances (a) are callable and (b) work with instanceof.
SteppableFunction = makeCallableClass({
    // Create a new SteppableFunction instance.
    constructor: function (bodyFunc, options) {
        assert(typeof bodyFunc === 'function');
        options = options || { pseudoYield: null, pseudoConst: null, require: null };
        this.stateMachine = makeStateMachine(bodyFunc, options);
    },
    // Calling the instance creates and returns a new steppable object.
    call: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var steppable = new SteppableObject(this.stateMachine);
        steppable.state = { local: { arguments: args } };
        return steppable;
    }
});
// Define the static `fromStateMachine` method on the SteppableFunction callable class.
SteppableFunction.fromStateMachine = function (stateMachine) {
    var instance = new SteppableFunction(function () { });
    instance.stateMachine = stateMachine;
    return instance;
};
/** Helper function for validating a function body and transforming it into a state machine. */
function makeStateMachine(bodyFunc, options) {
    // Transform original body function --> source code --> AST.
    var originalFunction = bodyFunc;
    var originalSource = '(' + originalFunction.toString() + ')';
    var originalAST = esprima.parse(originalSource);
    var exprStmt = originalAST.body[0];
    var funcExpr = exprStmt.expression;
    // Convert direct calls to ${pseudoYield} to equivalent yield expressions.
    if (options.pseudoYield)
        replacePseudoYieldCallsWithYieldExpressions(funcExpr, options.pseudoYield);
    // Convert variable declarations whose 'init' is a direct call to ${pseudoConst} to equivalent const declarations.
    if (options.pseudoConst)
        replacePseudoConstCallsWithConstDeclarations(funcExpr, options.pseudoConst);
    // Validate the AST.
    ensureNodesAreLegalForSteppableBody(funcExpr);
    ensureIdentifiersAreLegalForSteppableBody(funcExpr);
    ensureMutatingOperationsAreLegalForSteppableBody(funcExpr);
    ensureNestedFunctionsAreRelocatable(funcExpr);
    // Rewrite the AST in a form suitable for serialization/deserialization.
    var stateMachineAST = transformToStateMachine(funcExpr);
    // Declare a custom require function that is magic module aware.
    // TODO: doc coupling between this and its reference in Rewriter#generateAST (CTRL+F 'ambient.require = require' in transformToStateMachine.ts)
    // Transform modified AST --> source code --> function, closing over custom require function if given.
    var stateMachineSource = '(' + escodegen.generate(stateMachineAST) + ')';
    var stateMachine = (function (require) { return eval(stateMachineSource); })(options.require || require.main.require);
    // All done.
    return stateMachine;
}
module.exports = SteppableFunction;
//# sourceMappingURL=steppableFunction.js.map