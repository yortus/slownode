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
    // TODO: Flatten the AST...
    var exprStmt = originalAST.body[0];
    var funcExpr = exprStmt.expression;
    var modifiedAST = rewrite(funcExpr);
    // TODO: List all nodes...
    var nodes = [];
    traverse(funcExpr.body, function (node) { return nodes.push(node); });
    // TODO: temp testing... list all the local variable names
    var declarators = nodes
        .filter(function (node) { return node.type === 'VariableDeclaration'; })
        .map(function (decl) { return decl.declarations; });
    var defs = [].concat.apply([], declarators).map(function (decl) { return decl.id.name; });
    // TODO: temp testing... list all the referenced identifier names
    // NB: refs contains repeats and labels
    var refs = nodes.filter(function (node) { return node.type === 'Identifier'; }).map(function (id) { return id['name']; });
    // Synthesise: modified AST --> source code --> function.
    var modifiedSource = '(' + escodegen.generate(modifiedAST) + ')';
    var modifiedFunction = eval(modifiedSource);
    // Return the augmented function.
    return modifiedFunction;
}
module.exports = slowfunc;
//# sourceMappingURL=slowfunc.js.map