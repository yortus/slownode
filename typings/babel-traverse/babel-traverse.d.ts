/// <reference path="../babel-types/babel-types.d.ts" />


declare module "babel-traverse" {
    import * as t from 'babel-types';
    type Node = t.Node;

    export default function traverse(parent: Node | Node[], opts?: TraverseOptions, scope?: Scope, state?: any, parentPath?: NodePath<Node>): void;

    export interface TraverseOptions extends Visitor {
        scope?: Scope;
        noScope?: boolean;
    }

    export class Scope {
        constructor(path: NodePath<Node>, parentScope?: Scope);
        path: NodePath<Node>;
        block: Node;
        parentBlock: Node;
        parent: Scope;
        hub: Hub;
        bindings: { [name: string]: Binding; };
    }

    export class Binding {
        constructor(opts: { existing: Binding; identifier: t.IdentifierNode; scope: Scope; path: NodePath<Node>; kind: 'var' | 'let' | 'const'; });
        identifier: t.IdentifierNode;
        scope: Scope;
        path: NodePath<Node>;
        kind: 'var' | 'let' | 'const';
        referenced: boolean;
        references: number;
        referencePaths: NodePath<Node>[];
        constant: boolean;
        constantViolations: NodePath<Node>[];
    }

    export interface Visitor extends VisitNodeObject<Node> {
        Comment?: VisitNode<t.CommentNode>;
        SourceLocation?: VisitNode<t.SourceLocationNode>;
        BlockComment?: VisitNode<t.BlockCommentNode>;
        LineComment?: VisitNode<t.LineCommentNode>;
        ArrayExpression?: VisitNode<t.ArrayExpressionNode>;
        AssignmentExpression?: VisitNode<t.AssignmentExpressionNode>;
        LVal?: VisitNode<t.LValNode>;
        Expression?: VisitNode<t.ExpressionNode>;
        BinaryExpression?: VisitNode<t.BinaryExpressionNode>;
        Directive?: VisitNode<t.DirectiveNode>;
        DirectiveLiteral?: VisitNode<t.DirectiveLiteralNode>;
        BlockStatement?: VisitNode<t.BlockStatementNode>;
        BreakStatement?: VisitNode<t.BreakStatementNode>;
        Identifier?: VisitNode<t.IdentifierNode>;
        CallExpression?: VisitNode<t.CallExpressionNode>;
        CatchClause?: VisitNode<t.CatchClauseNode>;
        ConditionalExpression?: VisitNode<t.ConditionalExpressionNode>;
        ContinueStatement?: VisitNode<t.ContinueStatementNode>;
        DebuggerStatement?: VisitNode<t.DebuggerStatementNode>;
        DoWhileStatement?: VisitNode<t.DoWhileStatementNode>;
        Statement?: VisitNode<t.StatementNode>;
        EmptyStatement?: VisitNode<t.EmptyStatementNode>;
        ExpressionStatement?: VisitNode<t.ExpressionStatementNode>;
        File?: VisitNode<t.FileNode>;
        Program?: VisitNode<t.ProgramNode>;
        ForInStatement?: VisitNode<t.ForInStatementNode>;
        VariableDeclaration?: VisitNode<t.VariableDeclarationNode>;
        ForStatement?: VisitNode<t.ForStatementNode>;
        FunctionDeclaration?: VisitNode<t.FunctionDeclarationNode>;
        FunctionExpression?: VisitNode<t.FunctionExpressionNode>;
        IfStatement?: VisitNode<t.IfStatementNode>;
        LabeledStatement?: VisitNode<t.LabeledStatementNode>;
        StringLiteral?: VisitNode<t.StringLiteralNode>;
        NumericLiteral?: VisitNode<t.NumericLiteralNode>;
        NullLiteral?: VisitNode<t.NullLiteralNode>;
        BooleanLiteral?: VisitNode<t.BooleanLiteralNode>;
        RegExpLiteral?: VisitNode<t.RegExpLiteralNode>;
        LogicalExpression?: VisitNode<t.LogicalExpressionNode>;
        MemberExpression?: VisitNode<t.MemberExpressionNode>;
        NewExpression?: VisitNode<t.NewExpressionNode>;
        ObjectExpression?: VisitNode<t.ObjectExpressionNode>;
        ObjectMethod?: VisitNode<t.ObjectMethodNode>;
        ObjectProperty?: VisitNode<t.ObjectPropertyNode>;
        RestElement?: VisitNode<t.RestElementNode>;
        ReturnStatement?: VisitNode<t.ReturnStatementNode>;
        SequenceExpression?: VisitNode<t.SequenceExpressionNode>;
        SwitchCase?: VisitNode<t.SwitchCaseNode>;
        SwitchStatement?: VisitNode<t.SwitchStatementNode>;
        ThisExpression?: VisitNode<t.ThisExpressionNode>;
        ThrowStatement?: VisitNode<t.ThrowStatementNode>;
        TryStatement?: VisitNode<t.TryStatementNode>;
        UnaryExpression?: VisitNode<t.UnaryExpressionNode>;
        UpdateExpression?: VisitNode<t.UpdateExpressionNode>;
        VariableDeclarator?: VisitNode<t.VariableDeclaratorNode>;
        WhileStatement?: VisitNode<t.WhileStatementNode>;
        WithStatement?: VisitNode<t.WithStatementNode>;
        AssignmentPattern?: VisitNode<t.AssignmentPatternNode>;
        ArrayPattern?: VisitNode<t.ArrayPatternNode>;
        ArrowFunctionExpression?: VisitNode<t.ArrowFunctionExpressionNode>;
        ClassBody?: VisitNode<t.ClassBodyNode>;
        ClassDeclaration?: VisitNode<t.ClassDeclarationNode>;
        ClassExpression?: VisitNode<t.ClassExpressionNode>;
        ExportAllDeclaration?: VisitNode<t.ExportAllDeclarationNode>;
        ExportDefaultDeclaration?: VisitNode<t.ExportDefaultDeclarationNode>;
        ExportNamedDeclaration?: VisitNode<t.ExportNamedDeclarationNode>;
        Declaration?: VisitNode<t.DeclarationNode>;
        ExportSpecifier?: VisitNode<t.ExportSpecifierNode>;
        ForOfStatement?: VisitNode<t.ForOfStatementNode>;
        ImportDeclaration?: VisitNode<t.ImportDeclarationNode>;
        ImportDefaultSpecifier?: VisitNode<t.ImportDefaultSpecifierNode>;
        ImportNamespaceSpecifier?: VisitNode<t.ImportNamespaceSpecifierNode>;
        ImportSpecifier?: VisitNode<t.ImportSpecifierNode>;
        MetaProperty?: VisitNode<t.MetaPropertyNode>;
        ClassMethod?: VisitNode<t.ClassMethodNode>;
        ObjectPattern?: VisitNode<t.ObjectPatternNode>;
        SpreadElement?: VisitNode<t.SpreadElementNode>;
        Super?: VisitNode<t.SuperNode>;
        TaggedTemplateExpression?: VisitNode<t.TaggedTemplateExpressionNode>;
        TemplateLiteral?: VisitNode<t.TemplateLiteralNode>;
        TemplateElement?: VisitNode<t.TemplateElementNode>;
        YieldExpression?: VisitNode<t.YieldExpressionNode>;
        AnyTypeAnnotation?: VisitNode<t.AnyTypeAnnotationNode>;
        ArrayTypeAnnotation?: VisitNode<t.ArrayTypeAnnotationNode>;
        BooleanTypeAnnotation?: VisitNode<t.BooleanTypeAnnotationNode>;
        BooleanLiteralTypeAnnotation?: VisitNode<t.BooleanLiteralTypeAnnotationNode>;
        NullLiteralTypeAnnotation?: VisitNode<t.NullLiteralTypeAnnotationNode>;
        ClassImplements?: VisitNode<t.ClassImplementsNode>;
        ClassProperty?: VisitNode<t.ClassPropertyNode>;
        DeclareClass?: VisitNode<t.DeclareClassNode>;
        DeclareFunction?: VisitNode<t.DeclareFunctionNode>;
        DeclareInterface?: VisitNode<t.DeclareInterfaceNode>;
        DeclareModule?: VisitNode<t.DeclareModuleNode>;
        DeclareTypeAlias?: VisitNode<t.DeclareTypeAliasNode>;
        DeclareVariable?: VisitNode<t.DeclareVariableNode>;
        ExistentialTypeParam?: VisitNode<t.ExistentialTypeParamNode>;
        FunctionTypeAnnotation?: VisitNode<t.FunctionTypeAnnotationNode>;
        FunctionTypeParam?: VisitNode<t.FunctionTypeParamNode>;
        GenericTypeAnnotation?: VisitNode<t.GenericTypeAnnotationNode>;
        InterfaceExtends?: VisitNode<t.InterfaceExtendsNode>;
        InterfaceDeclaration?: VisitNode<t.InterfaceDeclarationNode>;
        IntersectionTypeAnnotation?: VisitNode<t.IntersectionTypeAnnotationNode>;
        MixedTypeAnnotation?: VisitNode<t.MixedTypeAnnotationNode>;
        NullableTypeAnnotation?: VisitNode<t.NullableTypeAnnotationNode>;
        NumericLiteralTypeAnnotation?: VisitNode<t.NumericLiteralTypeAnnotationNode>;
        NumberTypeAnnotation?: VisitNode<t.NumberTypeAnnotationNode>;
        StringLiteralTypeAnnotation?: VisitNode<t.StringLiteralTypeAnnotationNode>;
        StringTypeAnnotation?: VisitNode<t.StringTypeAnnotationNode>;
        ThisTypeAnnotation?: VisitNode<t.ThisTypeAnnotationNode>;
        TupleTypeAnnotation?: VisitNode<t.TupleTypeAnnotationNode>;
        TypeofTypeAnnotation?: VisitNode<t.TypeofTypeAnnotationNode>;
        TypeAlias?: VisitNode<t.TypeAliasNode>;
        TypeAnnotation?: VisitNode<t.TypeAnnotationNode>;
        TypeCastExpression?: VisitNode<t.TypeCastExpressionNode>;
        TypeParameterDeclaration?: VisitNode<t.TypeParameterDeclarationNode>;
        TypeParameterInstantiation?: VisitNode<t.TypeParameterInstantiationNode>;
        ObjectTypeAnnotation?: VisitNode<t.ObjectTypeAnnotationNode>;
        ObjectTypeCallProperty?: VisitNode<t.ObjectTypeCallPropertyNode>;
        ObjectTypeIndexer?: VisitNode<t.ObjectTypeIndexerNode>;
        ObjectTypeProperty?: VisitNode<t.ObjectTypePropertyNode>;
        QualifiedTypeIdentifier?: VisitNode<t.QualifiedTypeIdentifierNode>;
        UnionTypeAnnotation?: VisitNode<t.UnionTypeAnnotationNode>;
        VoidTypeAnnotation?: VisitNode<t.VoidTypeAnnotationNode>;
        JSXAttribute?: VisitNode<t.JSXAttributeNode>;
        JSXIdentifier?: VisitNode<t.JSXIdentifierNode>;
        JSXNamespacedName?: VisitNode<t.JSXNamespacedNameNode>;
        JSXElement?: VisitNode<t.JSXElementNode>;
        JSXExpressionContainer?: VisitNode<t.JSXExpressionContainerNode>;
        JSXClosingElement?: VisitNode<t.JSXClosingElementNode>;
        JSXMemberExpression?: VisitNode<t.JSXMemberExpressionNode>;
        JSXOpeningElement?: VisitNode<t.JSXOpeningElementNode>;
        JSXEmptyExpression?: VisitNode<t.JSXEmptyExpressionNode>;
        JSXSpreadAttribute?: VisitNode<t.JSXSpreadAttributeNode>;
        JSXText?: VisitNode<t.JSXTextNode>;
        Noop?: VisitNode<t.NoopNode>;
        ParenthesizedExpression?: VisitNode<t.ParenthesizedExpressionNode>;
        AwaitExpression?: VisitNode<t.AwaitExpressionNode>;
        BindExpression?: VisitNode<t.BindExpressionNode>;
        Decorator?: VisitNode<t.DecoratorNode>;
        DoExpression?: VisitNode<t.DoExpressionNode>;
        ExportDefaultSpecifier?: VisitNode<t.ExportDefaultSpecifierNode>;
        ExportNamespaceSpecifier?: VisitNode<t.ExportNamespaceSpecifierNode>;
        RestProperty?: VisitNode<t.RestPropertyNode>;
        SpreadProperty?: VisitNode<t.SpreadPropertyNode>;
        Binary?: VisitNode<t.BinaryNode>;
        Scopable?: VisitNode<t.ScopableNode>;
        BlockParent?: VisitNode<t.BlockParentNode>;
        Block?: VisitNode<t.BlockNode>;
        Terminatorless?: VisitNode<t.TerminatorlessNode>;
        CompletionStatement?: VisitNode<t.CompletionStatementNode>;
        Conditional?: VisitNode<t.ConditionalNode>;
        Loop?: VisitNode<t.LoopNode>;
        While?: VisitNode<t.WhileNode>;
        ExpressionWrapper?: VisitNode<t.ExpressionWrapperNode>;
        For?: VisitNode<t.ForNode>;
        ForXStatement?: VisitNode<t.ForXStatementNode>;
        Function?: VisitNode<t.FunctionNode>;
        FunctionParent?: VisitNode<t.FunctionParentNode>;
        Pureish?: VisitNode<t.PureishNode>;
        Literal?: VisitNode<t.LiteralNode>;
        Immutable?: VisitNode<t.ImmutableNode>;
        UserWhitespacable?: VisitNode<t.UserWhitespacableNode>;
        Method?: VisitNode<t.MethodNode>;
        ObjectMember?: VisitNode<t.ObjectMemberNode>;
        Property?: VisitNode<t.PropertyNode>;
        UnaryLike?: VisitNode<t.UnaryLikeNode>;
        Pattern?: VisitNode<t.PatternNode>;
        Class?: VisitNode<t.ClassNode>;
        ModuleDeclaration?: VisitNode<t.ModuleDeclarationNode>;
        ExportDeclaration?: VisitNode<t.ExportDeclarationNode>;
        ModuleSpecifier?: VisitNode<t.ModuleSpecifierNode>;
        Flow?: VisitNode<t.FlowNode>;
        FlowBaseAnnotation?: VisitNode<t.FlowBaseAnnotationNode>;
        FlowDeclaration?: VisitNode<t.FlowDeclarationNode>;
        JSX?: VisitNode<t.JSXNode>;
    }

    export type VisitNode<T> = VisitNodeFunction<T> | VisitNodeObject<T>;

    export type VisitNodeFunction<T> = (path: NodePath<T>) => void;

    export interface VisitNodeObject<T> {
        enter?(path: NodePath<T>): void;
        exit?(path: NodePath<T>): void;
    }

    export class NodePath<T> {
        constructor(hub: Hub, parent: Node);
        parent: Node;
        hub: Hub;
        contexts: TraversalContext[];
        data: Object;
        shouldSkip: boolean;
        shouldStop: boolean;
        removed: boolean;
        state: any;
        opts: Object | null | undefined;
        skipKeys: Object | null | undefined;
        parentPath: NodePath<Node> | null | undefined;
        context: TraversalContext;
        container: Object | Object[] | null | undefined;
        listKey: string | null | undefined;
        inList: boolean;
        parentKey: string | null | undefined;
        key: string | null | undefined;
        node: T | null | undefined;
        scope: Scope;
        type: string | null | undefined;
        typeAnnotation: Object | null | undefined;

        traverse(visitor: Visitor, state?: any): void;
    }

    export class Hub {
        constructor(file, options);
        file: any;
        options: any;
    }

    interface TraversalContext {
        parentPath: NodePath<Node>;
        scope: Scope;
        state: any;
        opts: any;
    }
}
