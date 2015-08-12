import match = require('./match');
export = traverse;


// TODO: temp testing... depth-first preorder
function traverse(node: ESTree.Node, action: (node: ESTree.Node) => any): void {

    // TODO: ...
    var actionResult = action(node);
    if (actionResult === false) return; // break traversal immediately
    if (actionResult && actionResult.type) {

        // continue traversing on returned replacement node
        traverse(actionResult, action);
        return;
    }

    // TODO: ...
    match(node, {

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

        SequenceExpression: (expr) => expr.expressions.forEach(expr => traverse(expr, action)),

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

        Identifier: (expr) => {},

        TemplateLiteral: (expr) => expr.expressions.forEach(expr => traverse(expr, action)),

        Literal: (expr) => {},

        Otherwise: (node) => {
            throw new Error(`slowfunc: unsupported node type: '${node.type}'`);
        }
    });
}
