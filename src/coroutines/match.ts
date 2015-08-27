export = match;


/** Performs a caller-defined operation on an ESTree node using pattern matching to choose the appropriate action. */
function match<TReturn>(node: ESTree.Node, match: PatternMatch<TReturn>) {
    var func = match[node.type] || match.Otherwise;
    if (func) return <TReturn> func(node);
    throw new Error("match: no handler for node type '" + node.type + "'");
}


/** Helper interface that provides static typing for the match() function. */
interface PatternMatch<TReturn> {
    Program?:               (prog: ESTree.Program)                  => TReturn;
    FunctionDeclaration?:   (expr: ESTree.FunctionDeclaration)      => TReturn;
    FunctionExpression?:    (expr: ESTree.FunctionExpression)       => TReturn;

    // Statements
    EmptyStatement?:        (stmt: ESTree.EmptyStatement)           => TReturn;
    BlockStatement?:        (stmt: ESTree.BlockStatement)           => TReturn;
    ExpressionStatement?:   (stmt: ESTree.ExpressionStatement)      => TReturn;
    IfStatement?:           (stmt: ESTree.IfStatement)              => TReturn;
    SwitchStatement?:       (stmt: ESTree.SwitchStatement)          => TReturn;
    WhileStatement?:        (stmt: ESTree.WhileStatement)           => TReturn;
    DoWhileStatement?:      (stmt: ESTree.DoWhileStatement)         => TReturn;
    ForStatement?:          (stmt: ESTree.ForStatement)             => TReturn;
    ForInStatement?:        (stmt: ESTree.ForInStatement)           => TReturn;
    TryStatement?:          (stmt: ESTree.TryStatement)             => TReturn;
    LabeledStatement?:      (stmt: ESTree.LabeledStatement)         => TReturn;
    BreakStatement?:        (stmt: ESTree.BreakStatement)           => TReturn;
    ContinueStatement?:     (stmt: ESTree.ContinueStatement)        => TReturn;
    ReturnStatement?:       (stmt: ESTree.ReturnStatement)          => TReturn;
    ThrowStatement?:        (stmt: ESTree.ThrowStatement)           => TReturn;
    VariableDeclaration?:   (stmt: ESTree.VariableDeclaration)      => TReturn;

    // Expressions
    SequenceExpression?:    (expr: ESTree.SequenceExpression)       => TReturn;
    YieldExpression?:       (expr: ESTree.YieldExpression)          => TReturn;
    AssignmentExpression?:  (expr: ESTree.AssignmentExpression)     => TReturn;
    ConditionalExpression?: (expr: ESTree.ConditionalExpression)    => TReturn;
    LogicalExpression?:     (expr: ESTree.LogicalExpression)        => TReturn;
    BinaryExpression?:      (expr: ESTree.BinaryExpression)         => TReturn;
    UnaryExpression?:       (expr: ESTree.UnaryExpression)          => TReturn;
    UpdateExpression?:      (expr: ESTree.UpdateExpression)         => TReturn;
    CallExpression?:        (expr: ESTree.CallExpression)           => TReturn;
    NewExpression?:         (expr: ESTree.NewExpression)            => TReturn;
    MemberExpression?:      (expr: ESTree.MemberExpression)         => TReturn;
    ArrayExpression?:       (expr: ESTree.ArrayExpression)          => TReturn;
    ObjectExpression?:      (expr: ESTree.ObjectExpression)         => TReturn;
    Identifier?:            (expr: ESTree.Identifier)               => TReturn;
    TemplateLiteral?:       (expr: ESTree.TemplateLiteral)          => TReturn;
    RegexLiteral?:          (expr: ESTree.RegexLiteral)             => TReturn;
    Literal?:               (expr: ESTree.Literal)                  => TReturn;

    // Other
    Otherwise?:             (node: ESTree.Node)                     => TReturn;
}
