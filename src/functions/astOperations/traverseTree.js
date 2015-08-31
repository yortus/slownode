var matchNode = require('./matchNode');
/**
 * Traverses the AST rooted at the given `rootNode` in depth-first preorder.
 * The action callback is applied to each node in turn. If the action callback
 * returns false (using strict equality) for a particular node, then traversal
 * does not continue to that node's children. If the action callback returns
 * a node for a particular input node, then the returned node is traversed and
 * the input node's children are not traversed.
 */
function traverseTree(rootNode, action) {
    // Invoke the action on the root node.
    var actionResult = action(rootNode);
    // If the action returns false, skip the node's children.
    if (actionResult === false)
        return;
    // If the action returns a node, traverse the returned node recursively, and skip the original node's children.
    if (actionResult && actionResult.type) {
        traverseTree(actionResult, action);
        return;
    }
    // Recursively traverse the root node's children.
    matchNode(rootNode, {
        Program: function (prgm) { return prgm.body.forEach(function (stmt) { return traverseTree(stmt, action); }); },
        EmptyStatement: function (stmt) { },
        BlockStatement: function (stmt) { return stmt.body.forEach(function (stmt) { return traverseTree(stmt, action); }); },
        ExpressionStatement: function (stmt) { return traverseTree(stmt.expression, action); },
        IfStatement: function (stmt) {
            traverseTree(stmt.test, action);
            traverseTree(stmt.consequent, action);
            if (stmt.alternate)
                traverseTree(stmt.alternate, action);
        },
        SwitchStatement: function (stmt) {
            traverseTree(stmt.discriminant, action);
            stmt.cases.forEach(function (switchCase) {
                traverseTree(switchCase.test, action);
                switchCase.consequent.forEach(function (stmt) { return traverseTree(stmt, action); });
            });
        },
        WhileStatement: function (stmt) {
            traverseTree(stmt.test, action);
            traverseTree(stmt.body, action);
        },
        DoWhileStatement: function (stmt) {
            traverseTree(stmt.body, action);
            traverseTree(stmt.test, action);
        },
        ForStatement: function (stmt) {
            if (stmt.init)
                traverseTree(stmt.init, action);
            if (stmt.test)
                traverseTree(stmt.test, action);
            if (stmt.update)
                traverseTree(stmt.update, action);
            traverseTree(stmt.body, action);
        },
        ForInStatement: function (stmt) {
            traverseTree(stmt.left, action);
            traverseTree(stmt.right, action);
            traverseTree(stmt.body, action);
        },
        TryStatement: function (stmt) {
            traverseTree(stmt.block, action);
            if (stmt.handler) {
                traverseTree(stmt.handler.param, action);
                traverseTree(stmt.handler.body, action);
            }
            if (stmt.finalizer)
                traverseTree(stmt.finalizer, action);
        },
        LabeledStatement: function (stmt) {
            traverseTree(stmt.label, action);
            traverseTree(stmt.body, action);
        },
        BreakStatement: function (stmt) { return stmt.label && traverseTree(stmt.label, action); },
        ContinueStatement: function (stmt) { return stmt.label && traverseTree(stmt.label, action); },
        ReturnStatement: function (stmt) { return stmt.argument && traverseTree(stmt.argument, action); },
        ThrowStatement: function (stmt) { return traverseTree(stmt.argument, action); },
        VariableDeclaration: function (stmt) {
            stmt.declarations.forEach(function (decl) {
                traverseTree(decl.id, action);
                if (decl.init)
                    traverseTree(decl.init, action);
            });
        },
        FunctionDeclaration: function (stmt) {
            if (stmt.id)
                traverseTree(stmt.id, action);
            stmt.params.forEach(function (p) { return traverseTree(p, action); });
            traverseTree(stmt.body, action);
        },
        SequenceExpression: function (expr) { return expr.expressions.forEach(function (expr) { return traverseTree(expr, action); }); },
        YieldExpression: function (expr) {
            if (expr.argument)
                traverseTree(expr.argument, action);
        },
        AssignmentExpression: function (expr) {
            traverseTree(expr.left, action);
            traverseTree(expr.right, action);
        },
        ConditionalExpression: function (expr) {
            traverseTree(expr.test, action);
            traverseTree(expr.consequent, action);
            traverseTree(expr.alternate, action);
        },
        LogicalExpression: function (expr) {
            traverseTree(expr.left, action);
            traverseTree(expr.right, action);
        },
        BinaryExpression: function (expr) {
            traverseTree(expr.left, action);
            traverseTree(expr.right, action);
        },
        UnaryExpression: function (expr) { return traverseTree(expr.argument, action); },
        UpdateExpression: function (expr) { return traverseTree(expr.argument, action); },
        CallExpression: function (expr) {
            traverseTree(expr.callee, action);
            expr.arguments.forEach(function (arg) { return traverseTree(arg, action); });
        },
        NewExpression: function (expr) {
            traverseTree(expr.callee, action);
            expr.arguments.forEach(function (arg) { return traverseTree(arg, action); });
        },
        MemberExpression: function (expr) {
            traverseTree(expr.object, action);
            traverseTree(expr.property, action);
        },
        ArrayExpression: function (expr) { return expr.elements.forEach(function (elem) { return traverseTree(elem, action); }); },
        ObjectExpression: function (expr) {
            expr.properties.forEach(function (prop) {
                traverseTree(prop.key, action);
                traverseTree(prop.value, action);
            });
        },
        FunctionExpression: function (expr) {
            if (expr.id)
                traverseTree(expr.id, action);
            expr.params.forEach(function (p) { return traverseTree(p, action); });
            traverseTree(expr.body, action);
        },
        Identifier: function (expr) { },
        TemplateLiteral: function (expr) { return expr.expressions.forEach(function (expr) { return traverseTree(expr, action); }); },
        Literal: function (expr) { },
        Otherwise: function (node) {
            throw new Error("slowfunc: unsupported node type: '" + node.type + "'");
        }
    });
}
module.exports = traverseTree;
//# sourceMappingURL=traverseTree.js.map