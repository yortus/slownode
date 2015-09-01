var assert = require('assert');
var esprima = require('esprima');
var isRelocatable = require('./astOperations/funcExpr/isRelocatable');
// TODO: memoize results (use shasum and cache)
// TODO: doc...
function isRelocatableFunction(func) {
    // Validate arguments.
    assert(typeof func === 'function');
    // Transform original function --> source code --> AST.
    var originalFunction = func;
    var originalSource = '(' + originalFunction.toString() + ')';
    var originalAST = esprima.parse(originalSource);
    var exprStmt = originalAST.body[0];
    var funcExpr = exprStmt.expression;
    // Check for relocatability at the AST level.
    return isRelocatable(funcExpr);
}
module.exports = isRelocatableFunction;
//# sourceMappingURL=isRelocatableFunction.js.map