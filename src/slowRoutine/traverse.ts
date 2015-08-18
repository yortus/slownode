import match = require('./match');
export = traverse;


/**
 * Traverses the AST rooted at the given node in depth-first preorder.
 * The action callback is applied to each node in turn. If the action callback
 * returns false (using strict equality) for a particular node, then traversal
 * does not continue to that node's children. If the action callback returns
 * a node for a particular input node, then the returned node is traversed and
 * the input node's children are not traversed.
 */
function traverse(node: ESTree.Node, action: (node: ESTree.Node) => any): void {

    // Invoke the action on the root node.
    var actionResult = action(node);

    // If the action returns false, skip the node's children.
    if (actionResult === false) return;

    // If the action returns a node, traverse the returned node recursively, and skip the original node's children.
    if (actionResult && actionResult.type) {
        traverse(actionResult, action);
        return;
    }

    // Recursively traverse the root node's children.
    match(node, {

        Program: (prgm) => prgm.body.forEach(stmt => traverse(stmt, action)),

        EmptyStatement: (stmt) => {},

        BlockStatement: (stmt) => stmt.body.forEach(stmt => traverse(stmt, action)),

        ExpressionStatement: (stmt) => traverse(stmt.expression, action),

        IfStatement: (stmt) => {
            traverse(stmt.test, action);
            traverse(stmt.consequent, action);
            if (stmt.alternate) traverse(stmt.alternate, action);
        },

        SwitchStatement: (stmt) => {
            traverse(stmt.discriminant, action);
            stmt.cases.forEach(switchCase => {
                traverse(switchCase.test, action);
                switchCase.consequent.forEach(stmt => traverse(stmt, action));
            });
        },

        WhileStatement: (stmt) => {
            traverse(stmt.test, action);
            traverse(stmt.body, action);
        },

        DoWhileStatement: (stmt) => {
            traverse(stmt.body, action);
            traverse(stmt.test, action);
        },

        ForStatement: (stmt) => {
            if (stmt.init) traverse(stmt.init, action);
            if (stmt.test) traverse(stmt.test, action);
            if (stmt.update) traverse(stmt.update, action);
            traverse(stmt.body, action);
        },

        ForInStatement: (stmt) => {
            traverse(stmt.left, action);
            traverse(stmt.right, action);
            traverse(stmt.body, action);
        },

        TryStatement: (stmt) => {
            traverse(stmt.block, action);
            if (stmt.handler) {
                traverse(stmt.handler.param, action);
                traverse(stmt.handler.body, action);
            }
            if (stmt.finalizer) traverse(stmt.finalizer, action);
        },

        LabeledStatement: (stmt) => {
            traverse(stmt.label, action);
            traverse(stmt.body, action);
        },

        BreakStatement: (stmt) => stmt.label && traverse(stmt.label, action),

        ContinueStatement: (stmt) => stmt.label && traverse(stmt.label, action),

        ReturnStatement: (stmt) => stmt.argument && traverse(stmt.argument, action),

        ThrowStatement: (stmt) => traverse(stmt.argument, action),

        VariableDeclaration: (stmt) => {
            stmt.declarations.forEach(decl => {
                traverse(decl.id, action);
                if (decl.init) traverse(decl.init, action);
            });
        },

        FunctionDeclaration: (stmt) => {
            if (stmt.id) traverse(stmt.id, action);
            stmt.params.forEach(p => traverse(p, action));
            traverse(stmt.body, action);
        },

        SequenceExpression: (expr) => expr.expressions.forEach(expr => traverse(expr, action)),

        YieldExpression: (expr) => {
            if (expr.argument) traverse(expr.argument, action);
        },

        AssignmentExpression: (expr) => {
            traverse(expr.left, action);
            traverse(expr.right, action);
        },

        ConditionalExpression: (expr) => {
            traverse(expr.test, action);
            traverse(expr.consequent, action);
            traverse(expr.alternate, action);
        },

        LogicalExpression: (expr) => {
            traverse(expr.left, action);
            traverse(expr.right, action);
        },

        BinaryExpression: (expr) => {
            traverse(expr.left, action);
            traverse(expr.right, action);
        },

        UnaryExpression: (expr) => traverse(expr.argument, action),

        UpdateExpression: (expr) => traverse(expr.argument, action),

        CallExpression: (expr) => {
            traverse(expr.callee, action);
            expr.arguments.forEach(arg => traverse(arg, action));
        },

        NewExpression: (expr) => {
            traverse(expr.callee, action);
            expr.arguments.forEach(arg => traverse(arg, action));
        },

        MemberExpression: (expr) => {
            traverse(expr.object, action);
            traverse(expr.property, action);
        },

        ArrayExpression: (expr) => expr.elements.forEach(elem => traverse(elem, action)),

        ObjectExpression: (expr) => {
            expr.properties.forEach(prop => {
                traverse(prop.key, action);
                traverse(prop.value, action);
            });
        },

        FunctionExpression: (expr) => {
            if (expr.id) traverse(expr.id, action);
            expr.params.forEach(p => traverse(p, action));
            traverse(expr.body, action);
        },

        Identifier: (expr) => {},

        TemplateLiteral: (expr) => expr.expressions.forEach(expr => traverse(expr, action)),

        Literal: (expr) => {},

        Otherwise: (node) => {
            throw new Error(`slowfunc: unsupported node type: '${node.type}'`);
        }
    });
}
