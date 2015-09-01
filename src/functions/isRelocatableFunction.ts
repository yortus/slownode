import assert = require('assert');
import _ = require('lodash');
import types = require('types');
import esprima = require('esprima');
import escodegen = require('escodegen');
import isRelocatable = require('./astOperations/funcExpr/isRelocatable');
export = isRelocatableFunction;


// TODO: memoize results (use shasum and cache)


// TODO: doc...
function isRelocatableFunction(func: Function) {

    // Validate arguments.
    assert(typeof func === 'function');

    // Transform original function --> source code --> AST.
    var originalFunction = func;
    var originalSource = '(' + originalFunction.toString() + ')';
    var originalAST = esprima.parse(originalSource);
    var exprStmt = <ESTree.ExpressionStatement> originalAST.body[0];
    var funcExpr = <ESTree.FunctionExpression> exprStmt.expression;

    // Check for relocatability at the AST level.
    return isRelocatable(funcExpr);
}
