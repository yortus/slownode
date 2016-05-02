// TODO: doc... elided (types only)...
import * as babel from 'babel-core';
import {Node, Statement, Expression, ObjectProperty} from "babel-types";
import {Visitor} from "babel-traverse";
import * as types from "babel-types";


// TODO: doc...
let t: typeof types;
let transform: typeof babel.transform;
let transformFromAst: typeof babel.transformFromAst;
let template: typeof babel.template;
let evalStack: EvalStack;





export default function (b: typeof babel) {
    t = b.types;
    transform = b.transform;
    transformFromAst = b.transformFromAst;
    template = b.template;
    evalStack = new EvalStack();

    let done = false; // TODO: temp testing...
    return {
        visitor: <Visitor> {
            Program(path) {
                if (done) return;
                done = true;
                let newNode = transformToStateMachine(path.node);
                path.replaceWith(newNode);
            }
        }
    };
}





interface StmtList extends Array<Statement|StmtList> {}





function transformToStateMachine(prog: types.Program): types.Program {
    let stmts: StmtList = [].concat(...prog.body.map(flatten));
    let flatStmts: Statement[] = [];
    (function recurse(stmts: StmtList) {
        stmts.forEach(el => Array.isArray(el) ? recurse(el) : flatStmts.push(el));
    })(stmts);
    return t.program(flatStmts);
}





function flatten(node: Node): StmtList {
    return matchNode<StmtList>(node, {
        // ------------------------- core -------------------------
        // ArrayExpression: (node) => [***],
        // AssignmentExpression: (node) => [***],
        BinaryExpression: (node) => [flatten(node.left), flatten(node.right), evalStack.binary(node.operator)],
        // Directive: (node) => [***],
        // DirectiveLiteral: (node) => [***],
        // BlockStatement: (node) => [***],
        // BreakStatement: (node) => [***],
        // Identifier: (node) => [***],
        // CallExpression: (node) => [***],
        // CatchClause: (node) => [***],
        // ConditionalExpression: (node) => [***],
        // ContinueStatement: (node) => [***],
        // DebuggerStatement: (node) => [***],
        // DoWhileStatement: (node) => [***],
        // Statement: (node) => [***],
        // EmptyStatement: (node) => [***],
        ExpressionStatement: (node) => [flatten(node.expression), evalStack.pop()],
        // File: (node) => [***],
        // Program: (node) => [***],
        // ForInStatement: (node) => [***],
        // VariableDeclaration: (node) => [***],
        // ForStatement: (node) => [***],
        // FunctionDeclaration: (node) => [***],
        // FunctionExpression: (node) => [***],
        // IfStatement: (node) => [***],
        // LabeledStatement: (node) => [***],
        StringLiteral: (node) => evalStack.push(node),
        NumericLiteral: (node) => evalStack.push(node),
        NullLiteral: (node) => evalStack.push(<any> node),
        BooleanLiteral: (node) => evalStack.push(node),
        RegExpLiteral: (node) => evalStack.push(node),
        // LogicalExpression: (node) => [***],
        // MemberExpression: (node) => [***],
        // NewExpression: (node) => [***],
        // ObjectExpression: (node) => [***],
        // ObjectMethod: (node) => [***],
        // ObjectProperty: (node) => [***],
        // RestElement: (node) => [***],
        // ReturnStatement: (node) => [***],
        // SequenceExpression: (node) => [***],
        // SwitchCase: (node) => [***],
        // SwitchStatement: (node) => [***],
        // ThisExpression: (node) => [***],
        // ThrowStatement: (node) => [***],
        // TryStatement: (node) => [***],
        // UnaryExpression: (node) => [***],
        // UpdateExpression: (node) => [***],
        // VariableDeclarator: (node) => [***],
        // WhileStatement: (node) => [***],
        // WithStatement: (node) => [***],

        // ------------------------- es2015 -------------------------
        // AssignmentPattern: (node) => [***],
        // ArrayPattern: (node) => [***],
        // ArrowFunctionExpression: (node) => [***],
        // ClassBody: (node) => [***],
        // ClassDeclaration: (node) => [***],
        // ClassExpression: (node) => [***],
        // ExportAllDeclaration: (node) => [***],
        // ExportDefaultDeclaration: (node) => [***],
        // ExportNamedDeclaration: (node) => [***],
        // Declaration: (node) => [***],
        // ExportSpecifier: (node) => [***],
        // ForOfStatement: (node) => [***],
        // ImportDeclaration: (node) => [***],
        // ImportDefaultSpecifier: (node) => [***],
        // ImportNamespaceSpecifier: (node) => [***],
        // ImportSpecifier: (node) => [***],
        // MetaProperty: (node) => [***],
        // ClassMethod: (node) => [***],
        // ObjectPattern: (node) => [***],
        // SpreadElement: (node) => [***],
        // Super: (node) => [***],
        // TaggedTemplateExpression: (node) => [***],
        // TemplateLiteral: (node) => [***],
        // TemplateElement: (node) => [***],
        // YieldExpression: (node) => [***],

        // ------------------------- flow -------------------------
        // AnyTypeAnnotation: (node) => [***],
        // ArrayTypeAnnotation: (node) => [***],
        // BooleanTypeAnnotation: (node) => [***],
        // BooleanLiteralTypeAnnotation: (node) => [***],
        // NullLiteralTypeAnnotation: (node) => [***],
        // ClassImplements: (node) => [***],
        // ClassProperty: (node) => [***],
        // DeclareClass: (node) => [***],
        // DeclareFunction: (node) => [***],
        // DeclareInterface: (node) => [***],
        // DeclareModule: (node) => [***],
        // DeclareTypeAlias: (node) => [***],
        // DeclareVariable: (node) => [***],
        // ExistentialTypeParam: (node) => [***],
        // FunctionTypeAnnotation: (node) => [***],
        // FunctionTypeParam: (node) => [***],
        // GenericTypeAnnotation: (node) => [***],
        // InterfaceExtends: (node) => [***],
        // InterfaceDeclaration: (node) => [***],
        // IntersectionTypeAnnotation: (node) => [***],
        // MixedTypeAnnotation: (node) => [***],
        // NullableTypeAnnotation: (node) => [***],
        // NumericLiteralTypeAnnotation: (node) => [***],
        // NumberTypeAnnotation: (node) => [***],
        // StringLiteralTypeAnnotation: (node) => [***],
        // StringTypeAnnotation: (node) => [***],
        // ThisTypeAnnotation: (node) => [***],
        // TupleTypeAnnotation: (node) => [***],
        // TypeofTypeAnnotation: (node) => [***],
        // TypeAlias: (node) => [***],
        // TypeAnnotation: (node) => [***],
        // TypeCastExpression: (node) => [***],
        // TypeParameterDeclaration: (node) => [***],
        // TypeParameterInstantiation: (node) => [***],
        // ObjectTypeAnnotation: (node) => [***],
        // ObjectTypeCallProperty: (node) => [***],
        // ObjectTypeIndexer: (node) => [***],
        // ObjectTypeProperty: (node) => [***],
        // QualifiedTypeIdentifier: (node) => [***],
        // UnionTypeAnnotation: (node) => [***],
        // VoidTypeAnnotation: (node) => [***],

        // ------------------------- jsx -------------------------
        // JSXAttribute: (node) => [***],
        // JSXIdentifier: (node) => [***],
        // JSXNamespacedName: (node) => [***],
        // JSXElement: (node) => [***],
        // JSXExpressionContainer: (node) => [***],
        // JSXClosingElement: (node) => [***],
        // JSXMemberExpression: (node) => [***],
        // JSXOpeningElement: (node) => [***],
        // JSXEmptyExpression: (node) => [***],
        // JSXSpreadAttribute: (node) => [***],
        // JSXText: (node) => [***],

        // ------------------------- misc -------------------------
        // Noop: (node) => [***],
        // ParenthesizedExpression: (node) => [***],

        // ------------------------- experimental -------------------------
        // AwaitExpression: (node) => [***],
        // BindExpression: (node) => [***],
        // Decorator: (node) => [***],
        // DoExpression: (node) => [***],
        // ExportDefaultSpecifier: (node) => [***],
        // ExportNamespaceSpecifier: (node) => [***],
        // RestProperty: (node) => [***],
        // SpreadProperty: (node) => [***],

        // ------------------------- aliases -------------------------
        // LVal: (node) => [***],
        // Expression: (node) => [***],
        // Binary: (node) => [***],
        // Scopable: (node) => [***],
        // BlockParent: (node) => [***],
        // Block: (node) => [***],
        // Terminatorless: (node) => [***],
        // CompletionStatement: (node) => [***],
        // Conditional: (node) => [***],
        // Loop: (node) => [***],
        // While: (node) => [***],
        // ExpressionWrapper: (node) => [***],
        // For: (node) => [***],
        // ForXStatement: (node) => [***],
        // Function: (node) => [***],
        // FunctionParent: (node) => [***],
        // Pureish: (node) => [***],
        // Literal: (node) => [***],
        // Immutable: (node) => [***],
        // UserWhitespacable: (node) => [***],
        // Method: (node) => [***],
        // ObjectMember: (node) => [***],
        // Property: (node) => [***],
        // UnaryLike: (node) => [***],
        // Pattern: (node) => [***],
        // Class: (node) => [***],
        // ModuleDeclaration: (node) => [***],
        // ExportDeclaration: (node) => [***],
        // ModuleSpecifier: (node) => [***],
        // Flow: (node) => [***],
        // FlowBaseAnnotation: (node) => [***],
        // FlowDeclaration: (node) => [***],
        // JSX: (node) => [***],
        // ------------------------- end -------------------------
    });
}





class EvalStack {
    
    push(expr: Expression) {
        return <Statement[]> [
            this.templates.push({VAL: expr})
            // t.expressionStatement(
            //     t.callExpression(
            //         t.memberExpression(
            //             t.identifier('Σ'),
            //             t.identifier('push')
            //         ),
            //         [expr]
            //     )
            // )
        ]
    }


    pop() {
        return [
            t.expressionStatement(
                t.callExpression(
                    t.memberExpression(
                        t.identifier('Σ'),
                        t.identifier('pop')
                    ),
                    []
                )
            )
        ];
    }


    binary(op: string) {
        return [
            t.expressionStatement(
                t.callExpression(
                    t.memberExpression(
                        t.identifier('Σ'),
                        t.identifier('binary')
                    ),
                    [t.stringLiteral(op)]
                )
            )
        ];
    }

    private templates = {
        push: template(`Σ.push(VAL)`),
        pop: template(`Σ.pop()`),
        binary: template(`Σ.binary(OP)`)
    };
}





// TODO: use node's assert when done testing in ASTExplorer.net
function assert(test: boolean, msg?: string) {
    if (test) return;
    throw new Error(msg || 'Assertion failed');
}

// TODO: use lodash (?) when done testing in ASTExplorer.net
function findLast<T>(arr: T[], pred: (t: T) => boolean): T {
    return arr[findLastIndex(arr, pred)];
}
function findLastIndex<T>(arr: T[], pred: (t: T) => boolean): number {
    for (let i = arr.length - 1; i >= 0; --i) {
        if (pred(arr[i])) return i;
    }
    return -1;
}





//========================= inlined match-node.ts =========================
// TODO: move this back out to own file after finished testing in ASTExplorer.net


/** Performs a caller-defined operation on an AST node using pattern matching to choose the appropriate action. */
function matchNode<TReturn>(node: Node, rules: RuleSet<TReturn>) {
    var handler = rules[node.type] || rules.Otherwise;
    if (handler) return <TReturn> handler(node);
    throw new Error("matchNode: no handler for node type '" + node.type + "'");
}





/** Helper interface that provides static typing for the match() function. */
export interface RuleSet<TReturn> {

    // Core
    ArrayExpression?:               Handler<types.ArrayExpression, TReturn>;
    AssignmentExpression?:          Handler<types.AssignmentExpression, TReturn>;
    LVal?:                          Handler<types.LVal, TReturn>;
    Expression?:                    Handler<types.Expression, TReturn>;
    BinaryExpression?:              Handler<types.BinaryExpression, TReturn>;
    Directive?:                     Handler<types.Directive, TReturn>;
    DirectiveLiteral?:              Handler<types.DirectiveLiteral, TReturn>;
    BlockStatement?:                Handler<types.BlockStatement, TReturn>;
    BreakStatement?:                Handler<types.BreakStatement, TReturn>;
    Identifier?:                    Handler<types.Identifier, TReturn>;
    CallExpression?:                Handler<types.CallExpression, TReturn>;
    CatchClause?:                   Handler<types.CatchClause, TReturn>;
    ConditionalExpression?:         Handler<types.ConditionalExpression, TReturn>;
    ContinueStatement?:             Handler<types.ContinueStatement, TReturn>;
    DebuggerStatement?:             Handler<types.DebuggerStatement, TReturn>;
    DoWhileStatement?:              Handler<types.DoWhileStatement, TReturn>;
    Statement?:                     Handler<types.Statement, TReturn>;
    EmptyStatement?:                Handler<types.EmptyStatement, TReturn>;
    ExpressionStatement?:           Handler<types.ExpressionStatement, TReturn>;
    File?:                          Handler<types.File, TReturn>;
    Program?:                       Handler<types.Program, TReturn>;
    ForInStatement?:                Handler<types.ForInStatement, TReturn>;
    VariableDeclaration?:           Handler<types.VariableDeclaration, TReturn>;
    ForStatement?:                  Handler<types.ForStatement, TReturn>;
    FunctionDeclaration?:           Handler<types.FunctionDeclaration, TReturn>;
    FunctionExpression?:            Handler<types.FunctionExpression, TReturn>;
    IfStatement?:                   Handler<types.IfStatement, TReturn>;
    LabeledStatement?:              Handler<types.LabeledStatement, TReturn>;
    StringLiteral?:                 Handler<types.StringLiteral, TReturn>;
    NumericLiteral?:                Handler<types.NumericLiteral, TReturn>;
    NullLiteral?:                   Handler<types.NullLiteral, TReturn>;
    BooleanLiteral?:                Handler<types.BooleanLiteral, TReturn>;
    RegExpLiteral?:                 Handler<types.RegExpLiteral, TReturn>;
    LogicalExpression?:             Handler<types.LogicalExpression, TReturn>;
    MemberExpression?:              Handler<types.MemberExpression, TReturn>;
    NewExpression?:                 Handler<types.NewExpression, TReturn>;
    ObjectExpression?:              Handler<types.ObjectExpression, TReturn>;
    ObjectMethod?:                  Handler<types.ObjectMethod, TReturn>;
    ObjectProperty?:                Handler<types.ObjectProperty, TReturn>;
    RestElement?:                   Handler<types.RestElement, TReturn>;
    ReturnStatement?:               Handler<types.ReturnStatement, TReturn>;
    SequenceExpression?:            Handler<types.SequenceExpression, TReturn>;
    SwitchCase?:                    Handler<types.SwitchCase, TReturn>;
    SwitchStatement?:               Handler<types.SwitchStatement, TReturn>;
    ThisExpression?:                Handler<types.ThisExpression, TReturn>;
    ThrowStatement?:                Handler<types.ThrowStatement, TReturn>;
    TryStatement?:                  Handler<types.TryStatement, TReturn>;
    UnaryExpression?:               Handler<types.UnaryExpression, TReturn>;
    UpdateExpression?:              Handler<types.UpdateExpression, TReturn>;
    VariableDeclarator?:            Handler<types.VariableDeclarator, TReturn>;
    WhileStatement?:                Handler<types.WhileStatement, TReturn>;
    WithStatement?:                 Handler<types.WithStatement, TReturn>;

    // ES2015
    AssignmentPattern?:             Handler<types.AssignmentPattern, TReturn>;
    ArrayPattern?:                  Handler<types.ArrayPattern, TReturn>;
    ArrowFunctionExpression?:       Handler<types.ArrowFunctionExpression, TReturn>;
    ClassBody?:                     Handler<types.ClassBody, TReturn>;
    ClassDeclaration?:              Handler<types.ClassDeclaration, TReturn>;
    ClassExpression?:               Handler<types.ClassExpression, TReturn>;
    ExportAllDeclaration?:          Handler<types.ExportAllDeclaration, TReturn>;
    ExportDefaultDeclaration?:      Handler<types.ExportDefaultDeclaration, TReturn>;
    ExportNamedDeclaration?:        Handler<types.ExportNamedDeclaration, TReturn>;
    Declaration?:                   Handler<types.Declaration, TReturn>;
    ExportSpecifier?:               Handler<types.ExportSpecifier, TReturn>;
    ForOfStatement?:                Handler<types.ForOfStatement, TReturn>;
    ImportDeclaration?:             Handler<types.ImportDeclaration, TReturn>;
    ImportDefaultSpecifier?:        Handler<types.ImportDefaultSpecifier, TReturn>;
    ImportNamespaceSpecifier?:      Handler<types.ImportNamespaceSpecifier, TReturn>;
    ImportSpecifier?:               Handler<types.ImportSpecifier, TReturn>;
    MetaProperty?:                  Handler<types.MetaProperty, TReturn>;
    ClassMethod?:                   Handler<types.ClassMethod, TReturn>;
    ObjectPattern?:                 Handler<types.ObjectPattern, TReturn>;
    SpreadElement?:                 Handler<types.SpreadElement, TReturn>;
    Super?:                         Handler<types.Super, TReturn>;
    TaggedTemplateExpression?:      Handler<types.TaggedTemplateExpression, TReturn>;
    TemplateLiteral?:               Handler<types.TemplateLiteral, TReturn>;
    TemplateElement?:               Handler<types.TemplateElement, TReturn>;
    YieldExpression?:               Handler<types.YieldExpression, TReturn>;

    // Flow / TypeScript
    AnyTypeAnnotation?:             Handler<types.AnyTypeAnnotation, TReturn>;
    ArrayTypeAnnotation?:           Handler<types.ArrayTypeAnnotation, TReturn>;
    BooleanTypeAnnotation?:         Handler<types.BooleanTypeAnnotation, TReturn>;
    BooleanLiteralTypeAnnotation?:  Handler<types.BooleanLiteralTypeAnnotation, TReturn>;
    NullLiteralTypeAnnotation?:     Handler<types.NullLiteralTypeAnnotation, TReturn>;
    ClassImplements?:               Handler<types.ClassImplements, TReturn>;
    ClassProperty?:                 Handler<types.ClassProperty, TReturn>;
    DeclareClass?:                  Handler<types.DeclareClass, TReturn>;
    DeclareFunction?:               Handler<types.DeclareFunction, TReturn>;
    DeclareInterface?:              Handler<types.DeclareInterface, TReturn>;
    DeclareModule?:                 Handler<types.DeclareModule, TReturn>;
    DeclareTypeAlias?:              Handler<types.DeclareTypeAlias, TReturn>;
    DeclareVariable?:               Handler<types.DeclareVariable, TReturn>;
    ExistentialTypeParam?:          Handler<types.ExistentialTypeParam, TReturn>;
    FunctionTypeAnnotation?:        Handler<types.FunctionTypeAnnotation, TReturn>;
    FunctionTypeParam?:             Handler<types.FunctionTypeParam, TReturn>;
    GenericTypeAnnotation?:         Handler<types.GenericTypeAnnotation, TReturn>;
    InterfaceExtends?:              Handler<types.InterfaceExtends, TReturn>;
    InterfaceDeclaration?:          Handler<types.InterfaceDeclaration, TReturn>;
    IntersectionTypeAnnotation?:    Handler<types.IntersectionTypeAnnotation, TReturn>;
    MixedTypeAnnotation?:           Handler<types.MixedTypeAnnotation, TReturn>;
    NullableTypeAnnotation?:        Handler<types.NullableTypeAnnotation, TReturn>;
    NumericLiteralTypeAnnotation?:  Handler<types.NumericLiteralTypeAnnotation, TReturn>;
    NumberTypeAnnotation?:          Handler<types.NumberTypeAnnotation, TReturn>;
    StringLiteralTypeAnnotation?:   Handler<types.StringLiteralTypeAnnotation, TReturn>;
    StringTypeAnnotation?:          Handler<types.StringTypeAnnotation, TReturn>;
    ThisTypeAnnotation?:            Handler<types.ThisTypeAnnotation, TReturn>;
    TupleTypeAnnotation?:           Handler<types.TupleTypeAnnotation, TReturn>;
    TypeofTypeAnnotation?:          Handler<types.TypeofTypeAnnotation, TReturn>;
    TypeAlias?:                     Handler<types.TypeAlias, TReturn>;
    TypeAnnotation?:                Handler<types.TypeAnnotation, TReturn>;
    TypeCastExpression?:            Handler<types.TypeCastExpression, TReturn>;
    TypeParameterDeclaration?:      Handler<types.TypeParameterDeclaration, TReturn>;
    TypeParameterInstantiation?:    Handler<types.TypeParameterInstantiation, TReturn>;
    ObjectTypeAnnotation?:          Handler<types.ObjectTypeAnnotation, TReturn>;
    ObjectTypeCallProperty?:        Handler<types.ObjectTypeCallProperty, TReturn>;
    ObjectTypeIndexer?:             Handler<types.ObjectTypeIndexer, TReturn>;
    ObjectTypeProperty?:            Handler<types.ObjectTypeProperty, TReturn>;
    QualifiedTypeIdentifier?:       Handler<types.QualifiedTypeIdentifier, TReturn>;
    UnionTypeAnnotation?:           Handler<types.UnionTypeAnnotation, TReturn>;
    VoidTypeAnnotation?:            Handler<types.VoidTypeAnnotation, TReturn>;

    // JSX
    JSXAttribute?:                  Handler<types.JSXAttribute, TReturn>;
    JSXIdentifier?:                 Handler<types.JSXIdentifier, TReturn>;
    JSXNamespacedName?:             Handler<types.JSXNamespacedName, TReturn>;
    JSXElement?:                    Handler<types.JSXElement, TReturn>;
    JSXExpressionContainer?:        Handler<types.JSXExpressionContainer, TReturn>;
    JSXClosingElement?:             Handler<types.JSXClosingElement, TReturn>;
    JSXMemberExpression?:           Handler<types.JSXMemberExpression, TReturn>;
    JSXOpeningElement?:             Handler<types.JSXOpeningElement, TReturn>;
    JSXEmptyExpression?:            Handler<types.JSXEmptyExpression, TReturn>;
    JSXSpreadAttribute?:            Handler<types.JSXSpreadAttribute, TReturn>;
    JSXText?:                       Handler<types.JSXText, TReturn>;

    // Misc
    Noop?:                          Handler<types.Noop, TReturn>;
    ParenthesizedExpression?:       Handler<types.ParenthesizedExpression, TReturn>;

    // Experimental
    AwaitExpression?:               Handler<types.AwaitExpression, TReturn>;
    BindExpression?:                Handler<types.BindExpression, TReturn>;
    Decorator?:                     Handler<types.Decorator, TReturn>;
    DoExpression?:                  Handler<types.DoExpression, TReturn>;
    ExportDefaultSpecifier?:        Handler<types.ExportDefaultSpecifier, TReturn>;
    ExportNamespaceSpecifier?:      Handler<types.ExportNamespaceSpecifier, TReturn>;
    RestProperty?:                  Handler<types.RestProperty, TReturn>;
    SpreadProperty?:                Handler<types.SpreadProperty, TReturn>;

    // Aliases and Virtual Types (babel6)
    Binary?:                        Handler<types.Binary, TReturn>;
    Scopable?:                      Handler<types.Scopable, TReturn>;
    BlockParent?:                   Handler<types.BlockParent, TReturn>;
    Block?:                         Handler<types.Block, TReturn>;
    Terminatorless?:                Handler<types.Terminatorless, TReturn>;
    CompletionStatement?:           Handler<types.CompletionStatement, TReturn>;
    Conditional?:                   Handler<types.Conditional, TReturn>;
    Loop?:                          Handler<types.Loop, TReturn>;
    While?:                         Handler<types.While, TReturn>;
    ExpressionWrapper?:             Handler<types.ExpressionWrapper, TReturn>;
    For?:                           Handler<types.For, TReturn>;
    ForXStatement?:                 Handler<types.ForXStatement, TReturn>;
    Function?:                      Handler<types.Function, TReturn>;
    FunctionParent?:                Handler<types.FunctionParent, TReturn>;
    Pureish?:                       Handler<types.Pureish, TReturn>;
    Literal?:                       Handler<types.Literal, TReturn>;
    Immutable?:                     Handler<types.Immutable, TReturn>;
    UserWhitespacable?:             Handler<types.UserWhitespacable, TReturn>;
    Method?:                        Handler<types.Method, TReturn>;
    ObjectMember?:                  Handler<types.ObjectMember, TReturn>;
    Property?:                      Handler<types.Property, TReturn>;
    UnaryLike?:                     Handler<types.UnaryLike, TReturn>;
    Pattern?:                       Handler<types.Pattern, TReturn>;
    Class?:                         Handler<types.Class, TReturn>;
    ModuleDeclaration?:             Handler<types.ModuleDeclaration, TReturn>;
    ExportDeclaration?:             Handler<types.ExportDeclaration, TReturn>;
    ModuleSpecifier?:               Handler<types.ModuleSpecifier, TReturn>;
    Flow?:                          Handler<types.Flow, TReturn>;
    FlowBaseAnnotation?:            Handler<types.FlowBaseAnnotation, TReturn>;
    FlowDeclaration?:               Handler<types.FlowDeclaration, TReturn>;
    JSX?:                           Handler<types.JSX, TReturn>;

    // Fallback
    Otherwise?:                     Handler<Node, TReturn>;
}





export type Handler<TNode extends Node, TReturn> = (node: TNode) => TReturn;





//========================= inlined traverse-tree.ts =========================
// TODO: move this back out to own file after finished testing in ASTExplorer.net


/**
 * Traverses the AST rooted at the given `rootNode` in depth-first preorder.
 * The action callback is applied to each node in turn. If the action callback
 * returns false (using strict equality) for a particular node, then traversal
 * does not continue to that node's children. If the action callback returns
 * a node for a particular input node, then the returned node is traversed and
 * the input node's children are not traversed.
 */
function traverseTree(rootNode: Node, action: (node: Node) => any): void {

    // Invoke the action on the root node.
    var actionResult = action(rootNode);

    // If the action returns false, skip the node's children.
    if (actionResult === false) return;

    // If the action returns a node, traverse the returned node recursively, and skip the original node's children.
    if (actionResult && actionResult.type) {
        traverseTree(actionResult, action);
        return;
    }

    // Recursively traverse the root node's children.
    matchNode(rootNode, {

        Program: (prgm) => prgm.body.forEach(stmt => traverseTree(stmt, action)),

        EmptyStatement: (stmt) => {},

        BlockStatement: (stmt) => stmt.body.forEach(stmt => traverseTree(stmt, action)),

        ExpressionStatement: (stmt) => traverseTree(stmt.expression, action),

        IfStatement: (stmt) => {
            traverseTree(stmt.test, action);
            traverseTree(stmt.consequent, action);
            if (stmt.alternate) traverseTree(stmt.alternate, action);
        },

        SwitchStatement: (stmt) => {
            traverseTree(stmt.discriminant, action);
            stmt.cases.forEach(switchCase => {
                traverseTree(switchCase.test, action);
                switchCase.consequent.forEach(stmt => traverseTree(stmt, action));
            });
        },

        WhileStatement: (stmt) => {
            traverseTree(stmt.test, action);
            traverseTree(stmt.body, action);
        },

        DoWhileStatement: (stmt) => {
            traverseTree(stmt.body, action);
            traverseTree(stmt.test, action);
        },

        ForStatement: (stmt) => {
            if (stmt.init) traverseTree(stmt.init, action);
            if (stmt.test) traverseTree(stmt.test, action);
            if (stmt.update) traverseTree(stmt.update, action);
            traverseTree(stmt.body, action);
        },

        ForInStatement: (stmt) => {
            traverseTree(stmt.left, action);
            traverseTree(stmt.right, action);
            traverseTree(stmt.body, action);
        },

        TryStatement: (stmt) => {
            traverseTree(stmt.block, action);
            if (stmt.handler) {
                traverseTree(stmt.handler.param, action);
                traverseTree(stmt.handler.body, action);
            }
            if (stmt.finalizer) traverseTree(stmt.finalizer, action);
        },

        LabeledStatement: (stmt) => {
            traverseTree(stmt.label, action);
            traverseTree(stmt.body, action);
        },

        BreakStatement: (stmt) => stmt.label && traverseTree(stmt.label, action),

        ContinueStatement: (stmt) => stmt.label && traverseTree(stmt.label, action),

        ReturnStatement: (stmt) => stmt.argument && traverseTree(stmt.argument, action),

        ThrowStatement: (stmt) => traverseTree(stmt.argument, action),

        DebuggerStatement: (stmt) => {},

        VariableDeclaration: (stmt) => {
            stmt.declarations.forEach(decl => {
                traverseTree(decl.id, action);
                if (decl.init) traverseTree(decl.init, action);
            });
        },

        FunctionDeclaration: (stmt) => {
            if (stmt.id) traverseTree(stmt.id, action);
            stmt.params.forEach(p => traverseTree(p, action));
            traverseTree(stmt.body, action);
        },

        SequenceExpression: (expr) => expr.expressions.forEach(expr => traverseTree(expr, action)),

        YieldExpression: (expr) => {
            if (expr.argument) traverseTree(expr.argument, action);
        },

        AssignmentExpression: (expr) => {
            traverseTree(expr.left, action);
            traverseTree(expr.right, action);
        },

        ConditionalExpression: (expr) => {
            traverseTree(expr.test, action);
            traverseTree(expr.consequent, action);
            traverseTree(expr.alternate, action);
        },

        LogicalExpression: (expr) => {
            traverseTree(expr.left, action);
            traverseTree(expr.right, action);
        },

        BinaryExpression: (expr) => {
            traverseTree(expr.left, action);
            traverseTree(expr.right, action);
        },

        UnaryExpression: (expr) => traverseTree(expr.argument, action),

        UpdateExpression: (expr) => traverseTree(expr.argument, action),

        CallExpression: (expr) => {
            traverseTree(expr.callee, action);
            expr.arguments.forEach(arg => traverseTree(arg, action));
        },

        NewExpression: (expr) => {
            traverseTree(expr.callee, action);
            expr.arguments.forEach(arg => traverseTree(arg, action));
        },

        MemberExpression: (expr) => {
            traverseTree(expr.object, action);
            traverseTree(expr.property, action);
        },

        ArrayExpression: (expr) => expr.elements.forEach(elem => traverseTree(elem, action)),

        ObjectExpression: (expr) => {
            expr.properties.forEach((prop: ObjectProperty) => {
                // TODO: will crash if prop is an ES6 ObjectMethod or SpreadProperty - add handling for these cases!
                traverseTree(prop.key, action);
                traverseTree(prop.value, action);
            });
        },

        FunctionExpression: (expr) => {
            if (expr.id) traverseTree(expr.id, action);
            expr.params.forEach(p => traverseTree(p, action));
            traverseTree(expr.body, action);
        },

        Identifier: (expr) => {},

        TemplateLiteral: (expr) => expr.expressions.forEach(expr => traverseTree(expr, action)),

        NumericLiteral: (expr) => {},

        StringLiteral: (expr) => {},

        BooleanLiteral: (expr) => {},

        RegExpLiteral: (expr) => {},

        NullLiteral: (expr) => {},

        Otherwise: (node) => {
            throw new Error(`traverseTree: unsupported node type: '${node.type}'`);
        }
    });
}
