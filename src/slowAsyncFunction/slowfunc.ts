import assert = require('assert');
import esprima = require('esprima');
import escodegen = require('escodegen');
import traverse = require('./traverse');
import rewrite = require('./rewrite');
export = slowfunc;


function slowfunc(fn: Function): Function {

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

    // Rewrite the AST into a form that supports persisting to storage.
    var exprStmt = <ESTree.ExpressionStatement> originalAST.body[0];
    var funcExpr = <ESTree.FunctionExpression> exprStmt.expression;
    var modifiedAST = rewrite(funcExpr);


    //// TODO: List all nodes...
    //var nodes: ESTree.Node[] = [];
    //traverse(funcExpr.body, node => nodes.push(node));

    //// TODO: temp testing... list all the local variable names
    //var declarators = nodes
    //    .filter(node => node.type === 'VariableDeclaration')
    //    .map((decl: ESTree.VariableDeclaration) => decl.declarations);
    //var defs: string[] = [].concat.apply([], declarators).map(decl => decl.id.name);

    //// TODO: temp testing... list all the referenced identifier names
    //// NB: refs contains repeats and labels
    //var refs = nodes.filter(node => node.type === 'Identifier').map(id => <string> id['name']);


    // Synthesise: modified AST --> source code --> function.
    var modifiedSource = '(' + escodegen.generate(modifiedAST) + ')';
    var modifiedFunction = eval(modifiedSource);

    // Return the augmented function.
    return modifiedFunction;
}
