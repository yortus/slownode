import assert = require('assert');
import _ = require('lodash');
import Types = require('slownode');
import esprima = require('esprima');
import escodegen = require('escodegen');
import traverse = require('./traverse');
import bodyRewriter = require('./bodyRewriter');
import match = require('./match');
export = makeSlowAsyncFunction;


// TODO: improve typing...
var makeSlowAsyncFunction: Types.SlowAsyncFunctionCtor = (fn: Function) => {

    // Validate argument.
    assert(typeof fn === 'function');

    // Analyse: original function --> source code --> AST.
    var originalFunction = fn;
    var originalSource = '(' + originalFunction.toString() + ')';
    var originalAST = esprima.parse(originalSource);

    //---------------------------------------------
    // TODO: static checks!!!
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
    //---------------------------------------------


    // TODO: Analyze and validate function...
    var exprStmt = <ESTree.ExpressionStatement> originalAST.body[0];
    var funcExpr = <ESTree.FunctionExpression> exprStmt.expression;

    // TODO: List all nodes...
    var nodes: ESTree.Node[] = [];
    traverse(funcExpr.body, node => nodes.push(node));

    // TODO: temp testing... list all the local variable names
    var paramNames = funcExpr.params.map(p => <string> p['name']);
    var declarators = nodes.filter(node => node.type === 'VariableDeclaration').map((decl: ESTree.VariableDeclaration) => decl.declarations);
    var declaredNames = _(declarators).flatten().map(decl => <string> decl.id.name).value();
    var catchParamNames = nodes.filter(node => node.type === 'TryStatement' && node['handler']).map((stmt: ESTree.TryStatement) => <string> stmt.handler.param['name'] );
    var localIdentifiers = [].concat(paramNames, declaredNames, catchParamNames);

    //TODO: doc this... implements one of the validation rules above...
    assert(catchParamNames.length === _.unique(catchParamNames).length);
    assert(_.intersection(paramNames, declaredNames, catchParamNames).length === 0);


    // TODO: list all label identifiers
//    var labelIdentifiers = nodes.filter(node => node.type === 'LabelledStatement').map((node: ESTree.LabeledStatement) => node.label.name);

    // TODO: temp testing... list all the nonlocal identifiers by traversing and excluding all identifiers that don't represent nonlocals
    // - identifiers that are in localIdentifiers
    // - identifiers that are object keys
    // - identifiers that are member expression properties
    var nonlocalIdentifiers: string[] = [];
    traverse(funcExpr.body, node => {
        return match<any>(node, {

            LabeledStatement: (stmt) => false,

            // TODO: the following two are really validation checks - separate them out...
            AssignmentExpression: (expr) => {
                // TODO: don't allow mutating to a nonlocal identifier!!!
                if (expr.left.type !== 'Identifier') return;
                var name = expr.left['name'];
                if (localIdentifiers.indexOf(name) === -1) throw new Error(`slowfunc: cannot mutate nonlocal identifier '${name}'`); // TODO: add test case for test this...
            },

            UpdateExpression: (expr) => {
                // TODO: don't allow mutating to a nonlocal identifier!!!
                if (expr.argument.type !== 'Identifier') return;
                var name = expr.argument['name'];
                if (localIdentifiers.indexOf(name) === -1) throw new Error(`slowfunc: cannot mutate nonlocal identifier '${name}'`); // TODO: add test case for test this...
            },

            MemberExpression: (expr) => {
                if (!expr.computed) return expr.object;
            },

            ObjectExpression: (expr) => {
                var computedKeyExprs = expr.properties.filter(p => p.computed).map(p => p.key);
                var valueExprs = expr.properties.map(p => p.value);
                return { type: 'ArrayExpression', elements: computedKeyExprs.concat(valueExprs) };
            },

            Identifier: (expr) => {
                if (localIdentifiers.indexOf(expr.name) === -1) nonlocalIdentifiers.push(expr.name);
            },

            Otherwise: (node) => { /* pass-through */ }
        });
    });
    nonlocalIdentifiers = _.unique(nonlocalIdentifiers);


    // TODO: list all!!!
    // TODO: ensure no clashes with generated locals like '$' (just reserve all names starting with '$'?)
    var whitelistedNonlocalIdentifiers = [
        'arguments',
        'Error',
        'Infinity',
        'console'
    ];

    // TODO: doc... rule check...
    var illegalNonlocals = _.difference(nonlocalIdentifiers, whitelistedNonlocalIdentifiers);
    if (illegalNonlocals.length > 0) throw new Error(`slowfunc: illegal nonlocal(s): '${illegalNonlocals.join("', '")}'`);

    // Rewrite the AST into a form that supports persisting to storage.
    var result = rewrite(funcExpr, nonlocalIdentifiers);

    // TODO: give the slowfunc its ID
    // TODO: use hashing!!
    result.__sfid = '123';

    // Return the augmented function.
    return result;
};


function rewrite(funcExpr: ESTree.FunctionExpression, nonlocalIdentifierNames: string[]) {

    // TODO: function body...
    var bodyAST = bodyRewriter.rewrite(funcExpr, nonlocalIdentifierNames);
    var bodySource = '(' + escodegen.generate(bodyAST) + ')';
    var bodyFunc = eval(bodySource);

    // TODO: function parameters...
    assert(funcExpr.params.every(p => p.type === 'Identifier'));
    var paramNames = funcExpr.params.map(p => <string> p['name']);

    // TODO: ...
    //var source = `
    //    (function slowAsyncFunction(${paramNames.join(', ')}) {
    //        for (var args = [], i = 0; i < arguments.length; ++i) args.push(arguments[i]);
    //        var state = { local: { arguments: args };
    //        var promise = bodyFunc(state);
    //        return promise;
    //    })
    //`;
    //var func = eval(source);


    var func: any = function(...args) {
        var state = { local: { arguments: args } };
        var promise = bodyFunc(state);
        return promise;
    };


    return func;
}



// TODO: use ES6 Symbol when TS supports them properly (TS1.5 only supports a subset of ES6 Symbol functionality)
var SlowFunctionIdPropertyKey = '__sfid';
