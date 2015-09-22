﻿import assert = require('assert');
import _ = require('lodash');
import esprima = require('esprima');
import escodegen = require('escodegen');
import makeCallableClass = require('../util/makeCallableClass');
import SteppableStateMachine = require('./steppableStateMachine');
import SteppableObject = require('./steppableObject');
import replacePseudoYieldCallsWithYieldExpressions = require('./astOperations/funcExpr/replacePseudoYieldCallsWithYieldExpressions');
import replacePseudoConstCallsWithConstDeclarations = require('./astOperations/funcExpr/replacePseudoConstCallsWithConstDeclarations');
import ensureNodesAreLegalForSteppableBody = require('./astOperations/funcExpr/ensureNodesAreLegalForSteppableBody');
import ensureIdentifiersAreLegalForSteppableBody = require('./astOperations/funcExpr/ensureIdentifiersAreLegalForSteppableBody');
import ensureMutatingOperationsAreLegalForSteppableBody = require('./astOperations/funcExpr/ensureMutatingOperationsAreLegalForSteppableBody');
import transformToStateMachine = require('./astOperations/funcExpr/transformToStateMachine');
export = SteppableFunction;


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
// NB: no need to check for general syntactic validity, since the function must be syntactically valid to have been passed in here.
// NB: either a normal function or generator function can be passed in - it makes no difference (doc why to do this (hint: yield keyword available in gens))
//---------------------------------------------


/**
 * Creates a SteppableFunction instance, calls to which return a SteppableObject instance.
 * A steppable function is analogous to an ES6 generator function.
 */
var SteppableFunction: {
    new(bodyFunc: Function, options?: Options): SteppableFunction;
    (bodyFunc: Function, options?: Options): SteppableFunction;
    fromStateMachine(stateMachine: SteppableStateMachine): SteppableFunction;
};
interface SteppableFunction {
    (...args: any[]): SteppableObject;
    stateMachine: SteppableStateMachine;
}


interface Options {
    pseudoYield?: string;
    pseudoConst?: string;
}



// Create a constructor function whose instances (a) are callable and (b) work with instanceof.
SteppableFunction = <any> makeCallableClass({

    // Create a new SteppableFunction instance.
    constructor: function (bodyFunc: Function, options?: Options) {
        assert(typeof bodyFunc === 'function');
        var pseudoYield = options ? options.pseudoYield : null;
        var pseudoConst = options ? options.pseudoConst : null;
        this.stateMachine = makeStateMachine(bodyFunc, options.pseudoYield, options.pseudoConst);
    },

    // Calling the instance creates and returns a new steppable object.
    call: function (...args: any[]): SteppableObject {
        var steppable = new SteppableObject(this.stateMachine);
        steppable.state = { local: { arguments: args } };
        return steppable;
    }
});


// Define the static `fromStateMachine` method on the SteppableFunction callable class.
SteppableFunction.fromStateMachine = (stateMachine: SteppableStateMachine) => {
    var instance = new SteppableFunction(() => {});
    instance.stateMachine = stateMachine;
    return instance;
};


/** Helper function for validating a function body and transforming it into a state machine. */
function makeStateMachine(bodyFunc: Function, pseudoYield: string, pseudoConst: string): SteppableStateMachine {

    // Transform original body function --> source code --> AST.
    var originalFunction = bodyFunc;
    var originalSource = '(' + originalFunction.toString() + ')';
    var originalAST = esprima.parse(originalSource);
    var exprStmt = <ESTree.ExpressionStatement> originalAST.body[0];
    var funcExpr = <ESTree.FunctionExpression> exprStmt.expression;

    // Convert direct calls to ${pseudoYield} to equivalent yield expressions.
    if (pseudoYield) replacePseudoYieldCallsWithYieldExpressions(funcExpr, pseudoYield);

    // Convert variable declarations whose 'init' is a direct call to ${pseudoConst} to equivalent const declarations.
    if (pseudoConst) replacePseudoConstCallsWithConstDeclarations(funcExpr, pseudoConst);

    // Validate the AST.
    ensureNodesAreLegalForSteppableBody(funcExpr);
    ensureIdentifiersAreLegalForSteppableBody(funcExpr);
    ensureMutatingOperationsAreLegalForSteppableBody(funcExpr);

    // Rewrite the AST in a form suitable for serialization/deserialization.
    var stateMachineAST = transformToStateMachine(funcExpr);

    // Transform modified AST --> source code --> function.
    var stateMachineSource = '(' + escodegen.generate(stateMachineAST) + ')';
    var stateMachine: SteppableStateMachine = eval(stateMachineSource);

    // All done.
    return stateMachine;
}
