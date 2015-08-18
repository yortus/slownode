import assert = require('assert');
import _ = require('lodash');
import Promise = require('bluebird');
import Types = require('slownode');
import esprima = require('esprima');
import escodegen = require('escodegen');
import traverse = require('./traverse');
import bodyRewriter = require('./bodyRewriter');
import match = require('./match');
export = SlowRoutine;


var SlowRoutine: Types.SlowRoutineStatic = <any> ((bodyFunction: Function, options?: Types.SlowRoutineOptions) => {

    options = options || { yieldIdentifier: null, constIdentifier: null };
    var body = transpileBodyFunction(bodyFunction, options.yieldIdentifier);

    // TODO: give the slowfunc its ID
    // TODO: use hashing!!
    body._sfid = '123';


    // TODO: temp testing...
    return body;
});


// TODO: improve typing...
var transpileBodyFunction = (bodyFunction: Function, yieldIdentifier: string) => {

    // Validate argument.
    assert(typeof bodyFunction === 'function');

    // Analyse: original function --> source code --> AST.
    var originalFunction = bodyFunction;
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


    // TODO: replace all direct calls to yieldIdentifier with equivalent yield expressions
    traverse(funcExpr.body, node => {
        return match<any>(node, {
            CallExpression: (expr) => {
                if (expr.callee.type !== 'Identifier') return;
                if (expr.callee['name'] !== yieldIdentifier) return;
                var args = expr.arguments;
                if (args.length > 1) throw new Error(`slowfunc: yield accepts at most one argument; ${args.length} supplied`);

                // Replace the CallExpression with a YieldExpression.
                Object.keys(node).forEach(key => delete node[key]);
                node.type = 'YieldExpression';
                if (args.length === 1) node['argument'] = args[0];
            },

            Otherwise: (node) => { /* pass-through */ }
        });
    });


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
        'console',
        'require'
    ];

    // TODO: doc... rule check...
    var illegalNonlocals = _.difference(nonlocalIdentifiers, whitelistedNonlocalIdentifiers);
    if (illegalNonlocals.length > 0) throw new Error(`slowfunc: illegal nonlocal(s): '${illegalNonlocals.join("', '")}'`);

    // Rewrite the AST into a form that supports persisting to storage.
    var result = rewrite(funcExpr, nonlocalIdentifiers);

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

    // Return a function with the same arity and parameter names as the body function it wraps.
    var func = eval(`(function SlowRoutineFunction(${paramNames.join(', ')}) { return inner.apply(null, arguments); })`);
    return func;

    // TODO: ...
    function inner(...args: any[]) {

        // TODO: set up initial state
        var state = <bodyRewriter.State> {
            local: { arguments: args }
        };

        // TODO: construct SlowRoutine instance...
        var result: Types.SlowRoutine = <any> {};
        result._srid = 'ABC123'; // TODO: assign proper ID!!!
        result._body = bodyFunc;
        result._state = state;
        result.next = makeResumer('yield', state);
        result.throw = makeResumer('throw', state);
        result.return = makeResumer('return', state);
        return result;
    };

    // TODO: ...
    function makeResumer(type: string, state: any) {
        return (value?: any) => {
            state.incoming = { type, value };
            bodyFunc(state);
            if (state.outgoing.type === 'throw') throw state.outgoing.value;
            return { done: state.outgoing.type === 'return', value: state.outgoing.value };
        };
    };
}
