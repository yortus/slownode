/// <reference path="babel-types.d.ts" />


declare module "babel-traverse" {

    export default function traverse(parent: AnyNode | AnyNode[], opts?: Visitor, scope?: Scope, state?: State, parentPath?: Path<AnyNode>): void;

    interface TraverseOptions extends Visitor {
        scope?: Scope;
        noScope?: boolean;
    }

    // TODO: ...
    interface Scope {}

    // TODO: ...
    interface State {}

    interface Path<T> {
        parent: AnyNode;
        node: T;
        scope: Scope;
        state: State;
        traverse(visitor: Visitor, state?: State): void;
    }

    type VisitNode<T> = ((path: Path<T>) => void) | { enter?(path: Path<T>): void; exit?(path: Path<T>): void; };

    interface Visitor {
        enter?(path: Path<AnyNode>): void;
        exit?(path: Path<AnyNode>): void;

        Comment?: VisitNode<CommentNode>;
        SourceLocation?: VisitNode<SourceLocationNode>;
        BlockComment?: VisitNode<BlockCommentNode>;
        LineComment?: VisitNode<LineCommentNode>;
        ArrayExpression?: VisitNode<ArrayExpressionNode>;
        AssignmentExpression?: VisitNode<AssignmentExpressionNode>;
        LVal?: VisitNode<LValNode>;
        Expression?: VisitNode<ExpressionNode>;
        BinaryExpression?: VisitNode<BinaryExpressionNode>;
        Directive?: VisitNode<DirectiveNode>;
        DirectiveLiteral?: VisitNode<DirectiveLiteralNode>;
        BlockStatement?: VisitNode<BlockStatementNode>;
        BreakStatement?: VisitNode<BreakStatementNode>;
        Identifier?: VisitNode<IdentifierNode>;
        CallExpression?: VisitNode<CallExpressionNode>;
        CatchClause?: VisitNode<CatchClauseNode>;
        ConditionalExpression?: VisitNode<ConditionalExpressionNode>;
        ContinueStatement?: VisitNode<ContinueStatementNode>;
        DebuggerStatement?: VisitNode<DebuggerStatementNode>;
        DoWhileStatement?: VisitNode<DoWhileStatementNode>;
        Statement?: VisitNode<StatementNode>;
        EmptyStatement?: VisitNode<EmptyStatementNode>;
        ExpressionStatement?: VisitNode<ExpressionStatementNode>;
        File?: VisitNode<FileNode>;
        Program?: VisitNode<ProgramNode>;
        ForInStatement?: VisitNode<ForInStatementNode>;
        VariableDeclaration?: VisitNode<VariableDeclarationNode>;
        ForStatement?: VisitNode<ForStatementNode>;
        FunctionDeclaration?: VisitNode<FunctionDeclarationNode>;
        FunctionExpression?: VisitNode<FunctionExpressionNode>;
        IfStatement?: VisitNode<IfStatementNode>;
        LabeledStatement?: VisitNode<LabeledStatementNode>;
        StringLiteral?: VisitNode<StringLiteralNode>;
        NumericLiteral?: VisitNode<NumericLiteralNode>;
        NullLiteral?: VisitNode<NullLiteralNode>;
        BooleanLiteral?: VisitNode<BooleanLiteralNode>;
        RegExpLiteral?: VisitNode<RegExpLiteralNode>;
        LogicalExpression?: VisitNode<LogicalExpressionNode>;
        MemberExpression?: VisitNode<MemberExpressionNode>;
        NewExpression?: VisitNode<NewExpressionNode>;
        ObjectExpression?: VisitNode<ObjectExpressionNode>;
        ObjectMethod?: VisitNode<ObjectMethodNode>;
        ObjectProperty?: VisitNode<ObjectPropertyNode>;
        RestElement?: VisitNode<RestElementNode>;
        ReturnStatement?: VisitNode<ReturnStatementNode>;
        SequenceExpression?: VisitNode<SequenceExpressionNode>;
        SwitchCase?: VisitNode<SwitchCaseNode>;
        SwitchStatement?: VisitNode<SwitchStatementNode>;
        ThisExpression?: VisitNode<ThisExpressionNode>;
        ThrowStatement?: VisitNode<ThrowStatementNode>;
        TryStatement?: VisitNode<TryStatementNode>;
        UnaryExpression?: VisitNode<UnaryExpressionNode>;
        UpdateExpression?: VisitNode<UpdateExpressionNode>;
        VariableDeclarator?: VisitNode<VariableDeclaratorNode>;
        WhileStatement?: VisitNode<WhileStatementNode>;
        WithStatement?: VisitNode<WithStatementNode>;
        AssignmentPattern?: VisitNode<AssignmentPatternNode>;
        ArrayPattern?: VisitNode<ArrayPatternNode>;
        ArrowFunctionExpression?: VisitNode<ArrowFunctionExpressionNode>;
        ClassBody?: VisitNode<ClassBodyNode>;
        ClassDeclaration?: VisitNode<ClassDeclarationNode>;
        ClassExpression?: VisitNode<ClassExpressionNode>;
        ExportAllDeclaration?: VisitNode<ExportAllDeclarationNode>;
        ExportDefaultDeclaration?: VisitNode<ExportDefaultDeclarationNode>;
        ExportNamedDeclaration?: VisitNode<ExportNamedDeclarationNode>;
        Declaration?: VisitNode<DeclarationNode>;
        ExportSpecifier?: VisitNode<ExportSpecifierNode>;
        ForOfStatement?: VisitNode<ForOfStatementNode>;
        ImportDeclaration?: VisitNode<ImportDeclarationNode>;
        ImportDefaultSpecifier?: VisitNode<ImportDefaultSpecifierNode>;
        ImportNamespaceSpecifier?: VisitNode<ImportNamespaceSpecifierNode>;
        ImportSpecifier?: VisitNode<ImportSpecifierNode>;
        MetaProperty?: VisitNode<MetaPropertyNode>;
        ClassMethod?: VisitNode<ClassMethodNode>;
        ObjectPattern?: VisitNode<ObjectPatternNode>;
        SpreadElement?: VisitNode<SpreadElementNode>;
        Super?: VisitNode<SuperNode>;
        TaggedTemplateExpression?: VisitNode<TaggedTemplateExpressionNode>;
        TemplateLiteral?: VisitNode<TemplateLiteralNode>;
        TemplateElement?: VisitNode<TemplateElementNode>;
        YieldExpression?: VisitNode<YieldExpressionNode>;
        AnyTypeAnnotation?: VisitNode<AnyTypeAnnotationNode>;
        ArrayTypeAnnotation?: VisitNode<ArrayTypeAnnotationNode>;
        BooleanTypeAnnotation?: VisitNode<BooleanTypeAnnotationNode>;
        BooleanLiteralTypeAnnotation?: VisitNode<BooleanLiteralTypeAnnotationNode>;
        NullLiteralTypeAnnotation?: VisitNode<NullLiteralTypeAnnotationNode>;
        ClassImplements?: VisitNode<ClassImplementsNode>;
        ClassProperty?: VisitNode<ClassPropertyNode>;
        DeclareClass?: VisitNode<DeclareClassNode>;
        DeclareFunction?: VisitNode<DeclareFunctionNode>;
        DeclareInterface?: VisitNode<DeclareInterfaceNode>;
        DeclareModule?: VisitNode<DeclareModuleNode>;
        DeclareTypeAlias?: VisitNode<DeclareTypeAliasNode>;
        DeclareVariable?: VisitNode<DeclareVariableNode>;
        ExistentialTypeParam?: VisitNode<ExistentialTypeParamNode>;
        FunctionTypeAnnotation?: VisitNode<FunctionTypeAnnotationNode>;
        FunctionTypeParam?: VisitNode<FunctionTypeParamNode>;
        GenericTypeAnnotation?: VisitNode<GenericTypeAnnotationNode>;
        InterfaceExtends?: VisitNode<InterfaceExtendsNode>;
        InterfaceDeclaration?: VisitNode<InterfaceDeclarationNode>;
        IntersectionTypeAnnotation?: VisitNode<IntersectionTypeAnnotationNode>;
        MixedTypeAnnotation?: VisitNode<MixedTypeAnnotationNode>;
        NullableTypeAnnotation?: VisitNode<NullableTypeAnnotationNode>;
        NumericLiteralTypeAnnotation?: VisitNode<NumericLiteralTypeAnnotationNode>;
        NumberTypeAnnotation?: VisitNode<NumberTypeAnnotationNode>;
        StringLiteralTypeAnnotation?: VisitNode<StringLiteralTypeAnnotationNode>;
        StringTypeAnnotation?: VisitNode<StringTypeAnnotationNode>;
        ThisTypeAnnotation?: VisitNode<ThisTypeAnnotationNode>;
        TupleTypeAnnotation?: VisitNode<TupleTypeAnnotationNode>;
        TypeofTypeAnnotation?: VisitNode<TypeofTypeAnnotationNode>;
        TypeAlias?: VisitNode<TypeAliasNode>;
        TypeAnnotation?: VisitNode<TypeAnnotationNode>;
        TypeCastExpression?: VisitNode<TypeCastExpressionNode>;
        TypeParameterDeclaration?: VisitNode<TypeParameterDeclarationNode>;
        TypeParameterInstantiation?: VisitNode<TypeParameterInstantiationNode>;
        ObjectTypeAnnotation?: VisitNode<ObjectTypeAnnotationNode>;
        ObjectTypeCallProperty?: VisitNode<ObjectTypeCallPropertyNode>;
        ObjectTypeIndexer?: VisitNode<ObjectTypeIndexerNode>;
        ObjectTypeProperty?: VisitNode<ObjectTypePropertyNode>;
        QualifiedTypeIdentifier?: VisitNode<QualifiedTypeIdentifierNode>;
        UnionTypeAnnotation?: VisitNode<UnionTypeAnnotationNode>;
        VoidTypeAnnotation?: VisitNode<VoidTypeAnnotationNode>;
        JSXAttribute?: VisitNode<JSXAttributeNode>;
        JSXIdentifier?: VisitNode<JSXIdentifierNode>;
        JSXNamespacedName?: VisitNode<JSXNamespacedNameNode>;
        JSXElement?: VisitNode<JSXElementNode>;
        JSXExpressionContainer?: VisitNode<JSXExpressionContainerNode>;
        JSXClosingElement?: VisitNode<JSXClosingElementNode>;
        JSXMemberExpression?: VisitNode<JSXMemberExpressionNode>;
        JSXOpeningElement?: VisitNode<JSXOpeningElementNode>;
        JSXEmptyExpression?: VisitNode<JSXEmptyExpressionNode>;
        JSXSpreadAttribute?: VisitNode<JSXSpreadAttributeNode>;
        JSXText?: VisitNode<JSXTextNode>;
        Noop?: VisitNode<NoopNode>;
        ParenthesizedExpression?: VisitNode<ParenthesizedExpressionNode>;
        AwaitExpression?: VisitNode<AwaitExpressionNode>;
        BindExpression?: VisitNode<BindExpressionNode>;
        Decorator?: VisitNode<DecoratorNode>;
        DoExpression?: VisitNode<DoExpressionNode>;
        ExportDefaultSpecifier?: VisitNode<ExportDefaultSpecifierNode>;
        ExportNamespaceSpecifier?: VisitNode<ExportNamespaceSpecifierNode>;
        RestProperty?: VisitNode<RestPropertyNode>;
        SpreadProperty?: VisitNode<SpreadPropertyNode>;
        Binary?: VisitNode<BinaryNode>;
        Scopable?: VisitNode<ScopableNode>;
        BlockParent?: VisitNode<BlockParentNode>;
        Block?: VisitNode<BlockNode>;
        Terminatorless?: VisitNode<TerminatorlessNode>;
        CompletionStatement?: VisitNode<CompletionStatementNode>;
        Conditional?: VisitNode<ConditionalNode>;
        Loop?: VisitNode<LoopNode>;
        While?: VisitNode<WhileNode>;
        ExpressionWrapper?: VisitNode<ExpressionWrapperNode>;
        For?: VisitNode<ForNode>;
        ForXStatement?: VisitNode<ForXStatementNode>;
        Function?: VisitNode<FunctionNode>;
        FunctionParent?: VisitNode<FunctionParentNode>;
        Pureish?: VisitNode<PureishNode>;
        Literal?: VisitNode<LiteralNode>;
        Immutable?: VisitNode<ImmutableNode>;
        UserWhitespacable?: VisitNode<UserWhitespacableNode>;
        Method?: VisitNode<MethodNode>;
        ObjectMember?: VisitNode<ObjectMemberNode>;
        Property?: VisitNode<PropertyNode>;
        UnaryLike?: VisitNode<UnaryLikeNode>;
        Pattern?: VisitNode<PatternNode>;
        Class?: VisitNode<ClassNode>;
        ModuleDeclaration?: VisitNode<ModuleDeclarationNode>;
        ExportDeclaration?: VisitNode<ExportDeclarationNode>;
        ModuleSpecifier?: VisitNode<ModuleSpecifierNode>;
        Flow?: VisitNode<FlowNode>;
        FlowBaseAnnotation?: VisitNode<FlowBaseAnnotationNode>;
        FlowDeclaration?: VisitNode<FlowDeclarationNode>;
        JSX?: VisitNode<JSXNode>;
    }
}
