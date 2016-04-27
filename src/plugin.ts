import * as babel from 'babel-core';
import {Visitor, NodePath} from "babel-traverse";
import {Node} from "babel-types";





// TODO: Babel-overcomer-device. See also http://entertainment.ie/images_content/MDQa6iC.png
let transformedNodes = new WeakSet<Node>();
function makeDepthFirstPostOrder(v: Visitor): Visitor {
    let result: Visitor = {};
    Object.keys(v).forEach(key => {
        result[key] = {
            exit(path: NodePath<Node>, state) {

                // Don't revisit substituted nodes or their children.
                for (let p = path; p; p = p.parentPath) {
                    if (transformedNodes.has(p.node)) return;
                }

                // Compute the new node and substitute it in place of the current one.
                let newNode = v[key](path, state);
                path.replaceWith(newNode);

                // Mark the new node as not-for-revisiting.
                transformedNodes.add(newNode);
            }
        };
    });
    return result;
}





export default function ({types: t}: typeof babel) {
    return { visitor: makeDepthFirstPostOrder({
        // ------------------------- core -------------------------
        // ArrayExpression(path, state) {...},
        // AssignmentExpression(path, state) {...},
        BinaryExpression: (path, state) => t.sequenceExpression([
            path.node.left,
            path.node.right,
            t.callExpression(
                t.memberExpression(
                    t.identifier('evaluator'),
                    t.identifier('binary')
                ),
                [t.stringLiteral(path.node.operator)]
            )
        ]),
        // Directive(path, state) {...},
        // DirectiveLiteral(path, state) {...},
        // BlockStatement(path, state) {...},
        // BreakStatement(path, state) {...},
        // Identifier(path, state) {...},
        // CallExpression(path, state) {...},
        // CatchClause(path, state) {...},
        // ConditionalExpression(path, state) {...},
        // ContinueStatement(path, state) {...},
        // DebuggerStatement(path, state) {...},
        // DoWhileStatement(path, state) {...},
        // Statement(path, state) {...},
        // EmptyStatement(path, state) {...},
        // ExpressionStatement(path, state) {...},
        // File(path, state) {...},
        // Program(path, state) {...},
        // ForInStatement(path, state) {...},
        // VariableDeclaration(path, state) {...},
        // ForStatement(path, state) {...},
        // FunctionDeclaration(path, state) {...},
        // FunctionExpression(path, state) {...},
        // IfStatement(path, state) {...},
        // LabeledStatement(path, state) {...},
        // StringLiteral(path, state) {...},
        NumericLiteral: (path, state) => t.callExpression(
            t.memberExpression(
                t.identifier('evaluator'),
                t.identifier('push')
            ),
            [path.node]
        ),
        // NullLiteral(path, state) {...},
        // BooleanLiteral(path, state) {...},
        // RegExpLiteral(path, state) {...},
        // LogicalExpression(path, state) {...},
        // MemberExpression(path, state) {...},
        // NewExpression(path, state) {...},
        // ObjectExpression(path, state) {...},
        // ObjectMethod(path, state) {...},
        // ObjectProperty(path, state) {...},
        // RestElement(path, state) {...},
        // ReturnStatement(path, state) {...},
        // SequenceExpression(path, state) {...},
        // SwitchCase(path, state) {...},
        // SwitchStatement(path, state) {...},
        // ThisExpression(path, state) {...},
        // ThrowStatement(path, state) {...},
        // TryStatement(path, state) {...},
        // UnaryExpression(path, state) {...},
        // UpdateExpression(path, state) {...},
        // VariableDeclarator(path, state) {...},
        // WhileStatement(path, state) {...},
        // WithStatement(path, state) {...},

        // ------------------------- es2015 -------------------------
        // AssignmentPattern(path, state) {...},
        // ArrayPattern(path, state) {...},
        // ArrowFunctionExpression(path, state) {...},
        // ClassBody(path, state) {...},
        // ClassDeclaration(path, state) {...},
        // ClassExpression(path, state) {...},
        // ExportAllDeclaration(path, state) {...},
        // ExportDefaultDeclaration(path, state) {...},
        // ExportNamedDeclaration(path, state) {...},
        // Declaration(path, state) {...},
        // ExportSpecifier(path, state) {...},
        // ForOfStatement(path, state) {...},
        // ImportDeclaration(path, state) {...},
        // ImportDefaultSpecifier(path, state) {...},
        // ImportNamespaceSpecifier(path, state) {...},
        // ImportSpecifier(path, state) {...},
        // MetaProperty(path, state) {...},
        // ClassMethod(path, state) {...},
        // ObjectPattern(path, state) {...},
        // SpreadElement(path, state) {...},
        // Super(path, state) {...},
        // TaggedTemplateExpression(path, state) {...},
        // TemplateLiteral(path, state) {...},
        // TemplateElement(path, state) {...},
        // YieldExpression(path, state) {...},

        // ------------------------- flow -------------------------
        // AnyTypeAnnotation(path, state) {...},
        // ArrayTypeAnnotation(path, state) {...},
        // BooleanTypeAnnotation(path, state) {...},
        // BooleanLiteralTypeAnnotation(path, state) {...},
        // NullLiteralTypeAnnotation(path, state) {...},
        // ClassImplements(path, state) {...},
        // ClassProperty(path, state) {...},
        // DeclareClass(path, state) {...},
        // DeclareFunction(path, state) {...},
        // DeclareInterface(path, state) {...},
        // DeclareModule(path, state) {...},
        // DeclareTypeAlias(path, state) {...},
        // DeclareVariable(path, state) {...},
        // ExistentialTypeParam(path, state) {...},
        // FunctionTypeAnnotation(path, state) {...},
        // FunctionTypeParam(path, state) {...},
        // GenericTypeAnnotation(path, state) {...},
        // InterfaceExtends(path, state) {...},
        // InterfaceDeclaration(path, state) {...},
        // IntersectionTypeAnnotation(path, state) {...},
        // MixedTypeAnnotation(path, state) {...},
        // NullableTypeAnnotation(path, state) {...},
        // NumericLiteralTypeAnnotation(path, state) {...},
        // NumberTypeAnnotation(path, state) {...},
        // StringLiteralTypeAnnotation(path, state) {...},
        // StringTypeAnnotation(path, state) {...},
        // ThisTypeAnnotation(path, state) {...},
        // TupleTypeAnnotation(path, state) {...},
        // TypeofTypeAnnotation(path, state) {...},
        // TypeAlias(path, state) {...},
        // TypeAnnotation(path, state) {...},
        // TypeCastExpression(path, state) {...},
        // TypeParameterDeclaration(path, state) {...},
        // TypeParameterInstantiation(path, state) {...},
        // ObjectTypeAnnotation(path, state) {...},
        // ObjectTypeCallProperty(path, state) {...},
        // ObjectTypeIndexer(path, state) {...},
        // ObjectTypeProperty(path, state) {...},
        // QualifiedTypeIdentifier(path, state) {...},
        // UnionTypeAnnotation(path, state) {...},
        // VoidTypeAnnotation(path, state) {...},

        // ------------------------- jsx -------------------------
        // JSXAttribute(path, state) {...},
        // JSXIdentifier(path, state) {...},
        // JSXNamespacedName(path, state) {...},
        // JSXElement(path, state) {...},
        // JSXExpressionContainer(path, state) {...},
        // JSXClosingElement(path, state) {...},
        // JSXMemberExpression(path, state) {...},
        // JSXOpeningElement(path, state) {...},
        // JSXEmptyExpression(path, state) {...},
        // JSXSpreadAttribute(path, state) {...},
        // JSXText(path, state) {...},

        // ------------------------- misc -------------------------
        // Noop(path, state) {...},
        // ParenthesizedExpression(path, state) {...},

        // ------------------------- experimental -------------------------
        // AwaitExpression(path, state) {...},
        // BindExpression(path, state) {...},
        // Decorator(path, state) {...},
        // DoExpression(path, state) {...},
        // ExportDefaultSpecifier(path, state) {...},
        // ExportNamespaceSpecifier(path, state) {...},
        // RestProperty(path, state) {...},
        // SpreadProperty(path, state) {...},

        // ------------------------- aliases -------------------------
        // LVal(path, state) {...},
        // Expression(path, state) {...},
        // Binary(path, state) {...},
        // Scopable(path, state) {...},
        // BlockParent(path, state) {...},
        // Block(path, state) {...},
        // Terminatorless(path, state) {...},
        // CompletionStatement(path, state) {...},
        // Conditional(path, state) {...},
        // Loop(path, state) {...},
        // While(path, state) {...},
        // ExpressionWrapper(path, state) {...},
        // For(path, state) {...},
        // ForXStatement(path, state) {...},
        // Function(path, state) {...},
        // FunctionParent(path, state) {...},
        // Pureish(path, state) {...},
        // Literal(path, state) {...},
        // Immutable(path, state) {...},
        // UserWhitespacable(path, state) {...},
        // Method(path, state) {...},
        // ObjectMember(path, state) {...},
        // Property(path, state) {...},
        // UnaryLike(path, state) {...},
        // Pattern(path, state) {...},
        // Class(path, state) {...},
        // ModuleDeclaration(path, state) {...},
        // ExportDeclaration(path, state) {...},
        // ModuleSpecifier(path, state) {...},
        // Flow(path, state) {...},
        // FlowBaseAnnotation(path, state) {...},
        // FlowDeclaration(path, state) {...},
        // JSX(path, state) {...},
        // ------------------------- end -------------------------
    })};
}
