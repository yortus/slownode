var assert = require('assert');
var esprima = require('esprima');
var escodegen = require('escodegen');
var traverse = require('./traverse');
var rewrite = require('./rewrite');
function slowfunc(fn) {
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
    var exprStmt = originalAST.body[0];
    var funcExpr = exprStmt.expression;
    // TODO: List all nodes...
    var nodes = [];
    traverse(funcExpr.body, function (node) { return nodes.push(node); });
    // TODO: temp testing... list all the local variable names
    var declarators = nodes
        .filter(function (node) { return node.type === 'VariableDeclaration'; })
        .map(function (decl) { return decl.declarations; });
    var localIdentifiers = [].concat.apply([], declarators).map(function (decl) { return decl.id.name; });
    //// TODO: temp testing... list all the referenced identifier names
    //// NB: refs contains repeats and labels
    //var refs = nodes.filter(node => node.type === 'Identifier').map(id => <string> id['name']);
    // TODO: list all!!!
    // TODO: ensure no clashes with generated locals like '$' (just reserve all names starting with '$'?)
    var whitelistedNonlocalIdentifiers = [
        'Error',
        'Infinity'
    ];
    // Rewrite the AST into a form that supports persisting to storage.
    var modifiedAST = rewrite(funcExpr, whitelistedNonlocalIdentifiers);
    // Synthesise: modified AST --> source code --> function.
    var modifiedSource = '(' + escodegen.generate(modifiedAST) + ')';
    var modifiedFunction = eval(modifiedSource);
    // Return the augmented function.
    return modifiedFunction;
}
module.exports = slowfunc;
//# sourceMappingURL=slowfunc.js.map