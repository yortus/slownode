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

    // TODO: Flatten the AST...
    var exprStmt = <ESTree.ExpressionStatement> originalAST.body[0];
    var funcExpr = <ESTree.FunctionExpression> exprStmt.expression;
    var modifiedAST = rewrite(funcExpr);

    // TODO: List all nodes...
    var nodes: ESTree.Node[] = [];
    traverse(funcExpr.body, node => nodes.push(node));

    // TODO: temp testing... list all the local variable names
    var declarators = nodes
        .filter(node => node.type === 'VariableDeclaration')
        .map((decl: ESTree.VariableDeclaration) => decl.declarations);
    var defs: string[] = [].concat.apply([], declarators).map(decl => decl.id.name);

    // TODO: temp testing... list all the referenced identifier names
    // NB: refs contains repeats and labels
    var refs = nodes.filter(node => node.type === 'Identifier').map(id => <string> id['name']);


    // Synthesise: modified AST --> source code --> function.
    var modifiedSource = '(' + escodegen.generate(modifiedAST) + ')';
    var modifiedFunction = eval(modifiedSource);

    // Return the augmented function.
    return modifiedFunction;
}
