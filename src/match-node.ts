import * as t from "babel-types";
import {Node} from "babel-types";





/** Performs a caller-defined operation on an AST node using pattern matching to choose the appropriate action. */
export default function matchNode<TReturn>(node: Node, rules: RuleSet<TReturn>) {
    var handler = rules[node.type] || rules.Otherwise;
    if (handler) return <TReturn> handler(node);
    throw new Error("matchNode: no handler for node type '" + node.type + "'");
}





/** Helper interface that provides static typing for the match() function. */
export interface RuleSet<TReturn> {

    // Core
    ArrayExpression?:               Handler<t.ArrayExpression, TReturn>;
    AssignmentExpression?:          Handler<t.AssignmentExpression, TReturn>;
    LVal?:                          Handler<t.LVal, TReturn>;
    Expression?:                    Handler<t.Expression, TReturn>;
    BinaryExpression?:              Handler<t.BinaryExpression, TReturn>;
    Directive?:                     Handler<t.Directive, TReturn>;
    DirectiveLiteral?:              Handler<t.DirectiveLiteral, TReturn>;
    BlockStatement?:                Handler<t.BlockStatement, TReturn>;
    BreakStatement?:                Handler<t.BreakStatement, TReturn>;
    Identifier?:                    Handler<t.Identifier, TReturn>;
    CallExpression?:                Handler<t.CallExpression, TReturn>;
    CatchClause?:                   Handler<t.CatchClause, TReturn>;
    ConditionalExpression?:         Handler<t.ConditionalExpression, TReturn>;
    ContinueStatement?:             Handler<t.ContinueStatement, TReturn>;
    DebuggerStatement?:             Handler<t.DebuggerStatement, TReturn>;
    DoWhileStatement?:              Handler<t.DoWhileStatement, TReturn>;
    Statement?:                     Handler<t.Statement, TReturn>;
    EmptyStatement?:                Handler<t.EmptyStatement, TReturn>;
    ExpressionStatement?:           Handler<t.ExpressionStatement, TReturn>;
    File?:                          Handler<t.File, TReturn>;
    Program?:                       Handler<t.Program, TReturn>;
    ForInStatement?:                Handler<t.ForInStatement, TReturn>;
    VariableDeclaration?:           Handler<t.VariableDeclaration, TReturn>;
    ForStatement?:                  Handler<t.ForStatement, TReturn>;
    FunctionDeclaration?:           Handler<t.FunctionDeclaration, TReturn>;
    FunctionExpression?:            Handler<t.FunctionExpression, TReturn>;
    IfStatement?:                   Handler<t.IfStatement, TReturn>;
    LabeledStatement?:              Handler<t.LabeledStatement, TReturn>;
    StringLiteral?:                 Handler<t.StringLiteral, TReturn>;
    NumericLiteral?:                Handler<t.NumericLiteral, TReturn>;
    NullLiteral?:                   Handler<t.NullLiteral, TReturn>;
    BooleanLiteral?:                Handler<t.BooleanLiteral, TReturn>;
    RegExpLiteral?:                 Handler<t.RegExpLiteral, TReturn>;
    LogicalExpression?:             Handler<t.LogicalExpression, TReturn>;
    MemberExpression?:              Handler<t.MemberExpression, TReturn>;
    NewExpression?:                 Handler<t.NewExpression, TReturn>;
    ObjectExpression?:              Handler<t.ObjectExpression, TReturn>;
    ObjectMethod?:                  Handler<t.ObjectMethod, TReturn>;
    ObjectProperty?:                Handler<t.ObjectProperty, TReturn>;
    RestElement?:                   Handler<t.RestElement, TReturn>;
    ReturnStatement?:               Handler<t.ReturnStatement, TReturn>;
    SequenceExpression?:            Handler<t.SequenceExpression, TReturn>;
    SwitchCase?:                    Handler<t.SwitchCase, TReturn>;
    SwitchStatement?:               Handler<t.SwitchStatement, TReturn>;
    ThisExpression?:                Handler<t.ThisExpression, TReturn>;
    ThrowStatement?:                Handler<t.ThrowStatement, TReturn>;
    TryStatement?:                  Handler<t.TryStatement, TReturn>;
    UnaryExpression?:               Handler<t.UnaryExpression, TReturn>;
    UpdateExpression?:              Handler<t.UpdateExpression, TReturn>;
    VariableDeclarator?:            Handler<t.VariableDeclarator, TReturn>;
    WhileStatement?:                Handler<t.WhileStatement, TReturn>;
    WithStatement?:                 Handler<t.WithStatement, TReturn>;

    // ES2015
    AssignmentPattern?:             Handler<t.AssignmentPattern, TReturn>;
    ArrayPattern?:                  Handler<t.ArrayPattern, TReturn>;
    ArrowFunctionExpression?:       Handler<t.ArrowFunctionExpression, TReturn>;
    ClassBody?:                     Handler<t.ClassBody, TReturn>;
    ClassDeclaration?:              Handler<t.ClassDeclaration, TReturn>;
    ClassExpression?:               Handler<t.ClassExpression, TReturn>;
    ExportAllDeclaration?:          Handler<t.ExportAllDeclaration, TReturn>;
    ExportDefaultDeclaration?:      Handler<t.ExportDefaultDeclaration, TReturn>;
    ExportNamedDeclaration?:        Handler<t.ExportNamedDeclaration, TReturn>;
    Declaration?:                   Handler<t.Declaration, TReturn>;
    ExportSpecifier?:               Handler<t.ExportSpecifier, TReturn>;
    ForOfStatement?:                Handler<t.ForOfStatement, TReturn>;
    ImportDeclaration?:             Handler<t.ImportDeclaration, TReturn>;
    ImportDefaultSpecifier?:        Handler<t.ImportDefaultSpecifier, TReturn>;
    ImportNamespaceSpecifier?:      Handler<t.ImportNamespaceSpecifier, TReturn>;
    ImportSpecifier?:               Handler<t.ImportSpecifier, TReturn>;
    MetaProperty?:                  Handler<t.MetaProperty, TReturn>;
    ClassMethod?:                   Handler<t.ClassMethod, TReturn>;
    ObjectPattern?:                 Handler<t.ObjectPattern, TReturn>;
    SpreadElement?:                 Handler<t.SpreadElement, TReturn>;
    Super?:                         Handler<t.Super, TReturn>;
    TaggedTemplateExpression?:      Handler<t.TaggedTemplateExpression, TReturn>;
    TemplateLiteral?:               Handler<t.TemplateLiteral, TReturn>;
    TemplateElement?:               Handler<t.TemplateElement, TReturn>;
    YieldExpression?:               Handler<t.YieldExpression, TReturn>;

    // Flow / TypeScript
    AnyTypeAnnotation?:             Handler<t.AnyTypeAnnotation, TReturn>;
    ArrayTypeAnnotation?:           Handler<t.ArrayTypeAnnotation, TReturn>;
    BooleanTypeAnnotation?:         Handler<t.BooleanTypeAnnotation, TReturn>;
    BooleanLiteralTypeAnnotation?:  Handler<t.BooleanLiteralTypeAnnotation, TReturn>;
    NullLiteralTypeAnnotation?:     Handler<t.NullLiteralTypeAnnotation, TReturn>;
    ClassImplements?:               Handler<t.ClassImplements, TReturn>;
    ClassProperty?:                 Handler<t.ClassProperty, TReturn>;
    DeclareClass?:                  Handler<t.DeclareClass, TReturn>;
    DeclareFunction?:               Handler<t.DeclareFunction, TReturn>;
    DeclareInterface?:              Handler<t.DeclareInterface, TReturn>;
    DeclareModule?:                 Handler<t.DeclareModule, TReturn>;
    DeclareTypeAlias?:              Handler<t.DeclareTypeAlias, TReturn>;
    DeclareVariable?:               Handler<t.DeclareVariable, TReturn>;
    ExistentialTypeParam?:          Handler<t.ExistentialTypeParam, TReturn>;
    FunctionTypeAnnotation?:        Handler<t.FunctionTypeAnnotation, TReturn>;
    FunctionTypeParam?:             Handler<t.FunctionTypeParam, TReturn>;
    GenericTypeAnnotation?:         Handler<t.GenericTypeAnnotation, TReturn>;
    InterfaceExtends?:              Handler<t.InterfaceExtends, TReturn>;
    InterfaceDeclaration?:          Handler<t.InterfaceDeclaration, TReturn>;
    IntersectionTypeAnnotation?:    Handler<t.IntersectionTypeAnnotation, TReturn>;
    MixedTypeAnnotation?:           Handler<t.MixedTypeAnnotation, TReturn>;
    NullableTypeAnnotation?:        Handler<t.NullableTypeAnnotation, TReturn>;
    NumericLiteralTypeAnnotation?:  Handler<t.NumericLiteralTypeAnnotation, TReturn>;
    NumberTypeAnnotation?:          Handler<t.NumberTypeAnnotation, TReturn>;
    StringLiteralTypeAnnotation?:   Handler<t.StringLiteralTypeAnnotation, TReturn>;
    StringTypeAnnotation?:          Handler<t.StringTypeAnnotation, TReturn>;
    ThisTypeAnnotation?:            Handler<t.ThisTypeAnnotation, TReturn>;
    TupleTypeAnnotation?:           Handler<t.TupleTypeAnnotation, TReturn>;
    TypeofTypeAnnotation?:          Handler<t.TypeofTypeAnnotation, TReturn>;
    TypeAlias?:                     Handler<t.TypeAlias, TReturn>;
    TypeAnnotation?:                Handler<t.TypeAnnotation, TReturn>;
    TypeCastExpression?:            Handler<t.TypeCastExpression, TReturn>;
    TypeParameterDeclaration?:      Handler<t.TypeParameterDeclaration, TReturn>;
    TypeParameterInstantiation?:    Handler<t.TypeParameterInstantiation, TReturn>;
    ObjectTypeAnnotation?:          Handler<t.ObjectTypeAnnotation, TReturn>;
    ObjectTypeCallProperty?:        Handler<t.ObjectTypeCallProperty, TReturn>;
    ObjectTypeIndexer?:             Handler<t.ObjectTypeIndexer, TReturn>;
    ObjectTypeProperty?:            Handler<t.ObjectTypeProperty, TReturn>;
    QualifiedTypeIdentifier?:       Handler<t.QualifiedTypeIdentifier, TReturn>;
    UnionTypeAnnotation?:           Handler<t.UnionTypeAnnotation, TReturn>;
    VoidTypeAnnotation?:            Handler<t.VoidTypeAnnotation, TReturn>;

    // JSX
    JSXAttribute?:                  Handler<t.JSXAttribute, TReturn>;
    JSXIdentifier?:                 Handler<t.JSXIdentifier, TReturn>;
    JSXNamespacedName?:             Handler<t.JSXNamespacedName, TReturn>;
    JSXElement?:                    Handler<t.JSXElement, TReturn>;
    JSXExpressionContainer?:        Handler<t.JSXExpressionContainer, TReturn>;
    JSXClosingElement?:             Handler<t.JSXClosingElement, TReturn>;
    JSXMemberExpression?:           Handler<t.JSXMemberExpression, TReturn>;
    JSXOpeningElement?:             Handler<t.JSXOpeningElement, TReturn>;
    JSXEmptyExpression?:            Handler<t.JSXEmptyExpression, TReturn>;
    JSXSpreadAttribute?:            Handler<t.JSXSpreadAttribute, TReturn>;
    JSXText?:                       Handler<t.JSXText, TReturn>;

    // Misc
    Noop?:                          Handler<t.Noop, TReturn>;
    ParenthesizedExpression?:       Handler<t.ParenthesizedExpression, TReturn>;

    // Experimental
    AwaitExpression?:               Handler<t.AwaitExpression, TReturn>;
    BindExpression?:                Handler<t.BindExpression, TReturn>;
    Decorator?:                     Handler<t.Decorator, TReturn>;
    DoExpression?:                  Handler<t.DoExpression, TReturn>;
    ExportDefaultSpecifier?:        Handler<t.ExportDefaultSpecifier, TReturn>;
    ExportNamespaceSpecifier?:      Handler<t.ExportNamespaceSpecifier, TReturn>;
    RestProperty?:                  Handler<t.RestProperty, TReturn>;
    SpreadProperty?:                Handler<t.SpreadProperty, TReturn>;

    // Aliases and Virtual Types (babel6)
    Binary?:                        Handler<t.Binary, TReturn>;
    Scopable?:                      Handler<t.Scopable, TReturn>;
    BlockParent?:                   Handler<t.BlockParent, TReturn>;
    Block?:                         Handler<t.Block, TReturn>;
    Terminatorless?:                Handler<t.Terminatorless, TReturn>;
    CompletionStatement?:           Handler<t.CompletionStatement, TReturn>;
    Conditional?:                   Handler<t.Conditional, TReturn>;
    Loop?:                          Handler<t.Loop, TReturn>;
    While?:                         Handler<t.While, TReturn>;
    ExpressionWrapper?:             Handler<t.ExpressionWrapper, TReturn>;
    For?:                           Handler<t.For, TReturn>;
    ForXStatement?:                 Handler<t.ForXStatement, TReturn>;
    Function?:                      Handler<t.Function, TReturn>;
    FunctionParent?:                Handler<t.FunctionParent, TReturn>;
    Pureish?:                       Handler<t.Pureish, TReturn>;
    Literal?:                       Handler<t.Literal, TReturn>;
    Immutable?:                     Handler<t.Immutable, TReturn>;
    UserWhitespacable?:             Handler<t.UserWhitespacable, TReturn>;
    Method?:                        Handler<t.Method, TReturn>;
    ObjectMember?:                  Handler<t.ObjectMember, TReturn>;
    Property?:                      Handler<t.Property, TReturn>;
    UnaryLike?:                     Handler<t.UnaryLike, TReturn>;
    Pattern?:                       Handler<t.Pattern, TReturn>;
    Class?:                         Handler<t.Class, TReturn>;
    ModuleDeclaration?:             Handler<t.ModuleDeclaration, TReturn>;
    ExportDeclaration?:             Handler<t.ExportDeclaration, TReturn>;
    ModuleSpecifier?:               Handler<t.ModuleSpecifier, TReturn>;
    Flow?:                          Handler<t.Flow, TReturn>;
    FlowBaseAnnotation?:            Handler<t.FlowBaseAnnotation, TReturn>;
    FlowDeclaration?:               Handler<t.FlowDeclaration, TReturn>;
    JSX?:                           Handler<t.JSX, TReturn>;

    // Fallback
    Otherwise?:                     Handler<Node, TReturn>;
}





export type Handler<TNode extends Node, TReturn> = (node: TNode) => TReturn;
