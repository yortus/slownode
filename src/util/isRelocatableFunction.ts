﻿import assert = require('assert');
import esprima = require('esprima');
import isRelocatable = require('./estree/funcExpr/isRelocatable');
export = isRelocatableFunction;


// TODO: memoize results (use shasum and cache)


/**
 * Determines whether the given function is relocatable. A relocatable function is one whose
 * meaning remains the same after being converted to a string (via toString()) then converted
 * back to a function (via eval()). Constructs that prevent a function being relocatable are:
 * - references to free variables other than: globals, `safeIds`, __dirname, __filename, or require.
 * - references to __dirname, __filename or require where the function's base location is unknown.
 * @param func the function body to check for relocatability, which may be given as a source string.
 * @param safeIds closed-over identifiers that are known to be relocatable.
 */
function isRelocatableFunction(func: Function|string, safeIds?: string[]) {

    // Validate arguments.
    assert(typeof func === 'function' || typeof func === 'string');

    // Transform original function --> source code --> AST.
    var source = '(' + func.toString() + ')';
    var ast = esprima.parse(source);
    var exprStmt = <ESTree.ExpressionStatement> ast.body[0];
    var funcExpr = <ESTree.FunctionExpression> exprStmt.expression;

    // Check for relocatability at the AST level.
    return isRelocatable(funcExpr, safeIds);
}