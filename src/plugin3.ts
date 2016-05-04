// TODO: doc... elided (types only)...
import * as babel from 'babel-core';
import {Node, Statement, Expression, Identifier, ObjectProperty} from "babel-types";
import {Visitor} from "babel-traverse";
import * as types from "babel-types";





// TODO: doc...
let t: typeof types;
let transform: typeof babel.transform;
let transformFromAst: typeof babel.transformFromAst;
let template: typeof babel.template;


// TODO: temp testing...
interface SlowProgram {
    state: SlowProgramState;
    step(): SlowProgram;
    ready: Promise<void>;
    finished: boolean;
    sources: { [filename: string]: string };
    filename: string;
    line: number;
    column: number;
}
interface SlowProgramState {
    environment: Environment;
}
declare class Environment {
}
declare class Binding {
}





export default function (b: typeof babel) {
    t = b.types;
    transform = b.transform;
    transformFromAst = b.transformFromAst;
    template = b.template;


    let emit = new IL();


    let done = false; // TODO: temp testing...
    return {
        visitor: <Visitor> {
            Program(path) {
                if (done) return;
                done = true;
                transformToIL(path.node, emit);
                let newNode = emit.compile();
                path.replaceWith(newNode);
            }
        }
    };
}





interface StmtList extends Array<Statement|StmtList> {}





class IL {

    // [] => []
    label = (name: string) => this.addLine(`label('${name}')`);

    // [] => [elem]
    push = (val: string | number | boolean) => this.addLine(`push(${JSON.stringify(val)})`);

    // [elem] => []
    pop = () => this.addLine(`pop()`);

    // [name] => [val]
    get = () => this.addLine(`get()`);

    // [obj, prop] => [val]
    getProp = () => this.addLine(`getProp()`);

    // [name, val] => [val]
    set = () => this.addLine(`set()`);

    // [obj, prop, val] => [val]
    setProp = () => this.addLine(`setProp()`);

    // [] => []
    jump = (label: string) => this.addLine(`jump('${label}')`);

    // [] => []
    jumpIfTruthy = (label: string) => this.addLine(`jumpIfTruthy('${label}')`);

    // [] => []
    jumpIfFalsy = (label: string) => this.addLine(`jumpIfFalsy('${label}')`);

    // [...args] => [result]
    call = (funcName: string, argCount: number) => this.addLine(`call('${funcName}', ${argCount})`);

    private addLine(line: string) {
        this.lines.push(line);
        return this;
    }

    compile(): Node {
        var source = this.lines.join(';\n');
        return t.program(<any>template(source)());
    }

    private lines: string[] = [];
}





function transformToIL(prog: types.Program, il: IL) {
    let visitCounter = 0;
    visitStmt(prog);

    function visitStmt(stmt: Node) {
        let label = ((i) => (strs) => `${strs[0]}-${i}`)(++visitCounter);
        matchNode<void>(stmt, {
            // ------------------------- core -------------------------
            // Directive: stmt => [***],
            // DirectiveLiteral: stmt => [***],
            BlockStatement:         stmt => {
                                        stmt.body.forEach(visitStmt);
                                    },
            // BreakStatement: stmt => [***],
            // CatchClause: stmt => [***],
            // ContinueStatement: stmt => [***],
            // DebuggerStatement: stmt => [***],
            // DoWhileStatement: stmt => [***],
            // Statement: stmt => [***],
            EmptyStatement:         stmt => {},
            ExpressionStatement:    stmt => {
                                        visitExpr(stmt.expression);
                                        il.pop();
                                    },
            Program:                stmt => {
                                        stmt.body.forEach(visitStmt);
                                    },
            // ForInStatement: stmt => [***],
            // VariableDeclaration: stmt => [***],
            // ForStatement: stmt => [***],
            // FunctionDeclaration: stmt => [***],
            IfStatement:            stmt => {
                                        visitExpr(stmt.test);
                                        il.jumpIfFalsy(label`alternate`);
                                        visitStmt(stmt.consequent);
                                        il.jump(label`exit`);
                                        il.label(label`alternate`);
                                        visitStmt(stmt.alternate || t.blockStatement([]));
                                        il.label(label`exit`);
                                    },
            // LabeledStatement: stmt => [***],
            // ReturnStatement: stmt => [***],
            // SwitchCase: stmt => [***],
            // SwitchStatement: stmt => [***],
            // ThrowStatement: stmt => [***],
            // TryStatement: stmt => [***],
            // VariableDeclarator: stmt => [***],
            // WhileStatement: stmt => [***],
            // WithStatement: stmt => [***],

            // ------------------------- es2015 -------------------------
            // ClassBody: stmt => [***],
            // ClassDeclaration: stmt => [***],
            // ExportAllDeclaration: stmt => [***],
            // ExportDefaultDeclaration: stmt => [***],
            // ExportNamedDeclaration: stmt => [***],
            // Declaration: stmt => [***],
            // ExportSpecifier: stmt => [***],
            // ForOfStatement: stmt => [***],
            // ImportDeclaration: stmt => [***],
            // ImportDefaultSpecifier: stmt => [***],
            // ImportNamespaceSpecifier: stmt => [***],
            // ImportSpecifier: stmt => [***],
            // ClassMethod: stmt => [***],

            // ------------------------- experimental -------------------------
            // Decorator: stmt => [***],
            // ExportDefaultSpecifier: stmt => [***],
            // ExportNamespaceSpecifier: stmt => [***]
        });
    }
    function visitExpr(expr: Expression) {
        let label = ((i) => (strs) => `${strs[0]}-${i}`)(++visitCounter);
        matchNode<void>(expr, {
            // ------------------------- core -------------------------
            // ArrayExpression: expr => [***],
            AssignmentExpression:   expr => {
                                        assert(t.isIdentifier(expr.left) || t.isMemberExpression(expr.left)); // TODO: loosen up later...
                                        visitLVal(expr.left);
                                        visitExpr(expr.right);
                                        t.isIdentifier(expr.left) ? il.set() : il.setProp();
                                    },
            BinaryExpression:       expr => {
                                        visitExpr(expr.left);
                                        visitExpr(expr.right);
                                        il.call(`operator${expr.operator}`, 2);
                                    },
            Identifier:             expr => {
                                        il.push(expr.name);
                                        il.get();
                                    },
            // CallExpression: expr => [***],
            // ConditionalExpression: expr => [***],
            // FunctionExpression: expr => [***],
            StringLiteral:          expr => {
                                        il.push(expr.value);
                                    },
            NumericLiteral:         expr => {
                                        il.push(expr.value);
                                    },
            NullLiteral:            expr => {
                                        il.push(null);
                                    },
            BooleanLiteral:         expr => {
                                        il.push(expr.value);
                                    },
            //RegExpLiteral: expr => [...],
            LogicalExpression:      expr => {
                                        visitExpr(expr.left);
                                        if (expr.operator === '&&') {
                                            il.jumpIfFalsy(label`exit`);
                                        }
                                        else {
                                            il.jumpIfTruthy(label`exit`);
                                        }
                                        il.pop();
                                        visitExpr(expr.right);
                                        il.label(label`exit`);
                                    },
            MemberExpression:       expr => {
                                        visitExpr(expr.object);
                                        if (expr.computed) {
                                            visitExpr(expr.property);
                                        }
                                        else {
                                            assert(t.isIdentifier(expr.property));
                                            il.push((<Identifier> expr.property).name);
                                        }
                                        il.getProp();
                                    },
            // NewExpression: expr => [***],
            // ObjectExpression: expr => [***],
            // ObjectMethod: expr => [***],
            // ObjectProperty: expr => [***],
            // SequenceExpression: expr => [***],
            // ThisExpression: expr => [***],
            UnaryExpression:        expr => {
                                        visitExpr(expr.argument);
                                        il.call(`operator${expr.operator}`, 1);
                                    },
            // UpdateExpression: expr => [***],

            // ------------------------- es2015 -------------------------
            // ArrowFunctionExpression: expr => [***],
            // ClassBody: expr => [***],
            // ClassExpression: expr => [***],
            // ClassMethod: expr => [***],
            // SpreadElement: expr => [***],
            // Super: expr => [***],
            // TaggedTemplateExpression: expr => [***],
            // TemplateLiteral: expr => [***],
            // TemplateElement: expr => [***],
            // YieldExpression: expr => [***],

            // ------------------------- experimental -------------------------
            // AwaitExpression: expr => [***]
        });
    }
    function visitLVal(expr: Node) {
        let label = ((i) => (strs) => `${strs[0]}-${i}`)(++visitCounter);
        matchNode<void>(expr, {
            // ------------------------- core -------------------------
            Identifier:             expr => {
                                        il.push(expr.name);
                                    },
            MemberExpression:       expr => {
                                        visitExpr(expr.object);
                                        if (expr.computed) {
                                            visitExpr(expr.property);
                                        }
                                        else {
                                            assert(t.isIdentifier(expr.property));
                                            il.push((<Identifier> expr.property).name);
                                        }
                                    },
            // RestElement: expr => [***],

            // ------------------------- es2015 -------------------------
            // AssignmentPattern: expr => [***],
            // ArrayPattern: expr => [***],
            // ObjectPattern: expr => [***],
        });
    }
}





// TODO: use node's assert when done testing in ASTExplorer.net
function assert(test: boolean, msg?: string) {
    if (test) return;
    throw new Error(msg || 'Assertion failed');
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
