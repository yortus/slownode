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
        constructor(opts: { existing: Binding; identifier: t.Identifier; scope: Scope; path: NodePath<Node>; kind: 'var' | 'let' | 'const'; });
        identifier: t.Identifier;
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
        Comment?: VisitNode<t.Comment>;
        SourceLocation?: VisitNode<t.SourceLocation>;
        BlockComment?: VisitNode<t.BlockComment>;
        LineComment?: VisitNode<t.LineComment>;
        ArrayExpression?: VisitNode<t.ArrayExpression>;
        AssignmentExpression?: VisitNode<t.AssignmentExpression>;
        LVal?: VisitNode<t.LVal>;
        Expression?: VisitNode<t.Expression>;
        BinaryExpression?: VisitNode<t.BinaryExpression>;
        Directive?: VisitNode<t.Directive>;
        DirectiveLiteral?: VisitNode<t.DirectiveLiteral>;
        BlockStatement?: VisitNode<t.BlockStatement>;
        BreakStatement?: VisitNode<t.BreakStatement>;
        Identifier?: VisitNode<t.Identifier>;
        CallExpression?: VisitNode<t.CallExpression>;
        CatchClause?: VisitNode<t.CatchClause>;
        ConditionalExpression?: VisitNode<t.ConditionalExpression>;
        ContinueStatement?: VisitNode<t.ContinueStatement>;
        DebuggerStatement?: VisitNode<t.DebuggerStatement>;
        DoWhileStatement?: VisitNode<t.DoWhileStatement>;
        Statement?: VisitNode<t.Statement>;
        EmptyStatement?: VisitNode<t.EmptyStatement>;
        ExpressionStatement?: VisitNode<t.ExpressionStatement>;
        File?: VisitNode<t.File>;
        Program?: VisitNode<t.Program>;
        ForInStatement?: VisitNode<t.ForInStatement>;
        VariableDeclaration?: VisitNode<t.VariableDeclaration>;
        ForStatement?: VisitNode<t.ForStatement>;
        FunctionDeclaration?: VisitNode<t.FunctionDeclaration>;
        FunctionExpression?: VisitNode<t.FunctionExpression>;
        IfStatement?: VisitNode<t.IfStatement>;
        LabeledStatement?: VisitNode<t.LabeledStatement>;
        StringLiteral?: VisitNode<t.StringLiteral>;
        NumericLiteral?: VisitNode<t.NumericLiteral>;
        NullLiteral?: VisitNode<t.NullLiteral>;
        BooleanLiteral?: VisitNode<t.BooleanLiteral>;
        RegExpLiteral?: VisitNode<t.RegExpLiteral>;
        LogicalExpression?: VisitNode<t.LogicalExpression>;
        MemberExpression?: VisitNode<t.MemberExpression>;
        NewExpression?: VisitNode<t.NewExpression>;
        ObjectExpression?: VisitNode<t.ObjectExpression>;
        ObjectMethod?: VisitNode<t.ObjectMethod>;
        ObjectProperty?: VisitNode<t.ObjectProperty>;
        RestElement?: VisitNode<t.RestElement>;
        ReturnStatement?: VisitNode<t.ReturnStatement>;
        SequenceExpression?: VisitNode<t.SequenceExpression>;
        SwitchCase?: VisitNode<t.SwitchCase>;
        SwitchStatement?: VisitNode<t.SwitchStatement>;
        ThisExpression?: VisitNode<t.ThisExpression>;
        ThrowStatement?: VisitNode<t.ThrowStatement>;
        TryStatement?: VisitNode<t.TryStatement>;
        UnaryExpression?: VisitNode<t.UnaryExpression>;
        UpdateExpression?: VisitNode<t.UpdateExpression>;
        VariableDeclarator?: VisitNode<t.VariableDeclarator>;
        WhileStatement?: VisitNode<t.WhileStatement>;
        WithStatement?: VisitNode<t.WithStatement>;
        AssignmentPattern?: VisitNode<t.AssignmentPattern>;
        ArrayPattern?: VisitNode<t.ArrayPattern>;
        ArrowFunctionExpression?: VisitNode<t.ArrowFunctionExpression>;
        ClassBody?: VisitNode<t.ClassBody>;
        ClassDeclaration?: VisitNode<t.ClassDeclaration>;
        ClassExpression?: VisitNode<t.ClassExpression>;
        ExportAllDeclaration?: VisitNode<t.ExportAllDeclaration>;
        ExportDefaultDeclaration?: VisitNode<t.ExportDefaultDeclaration>;
        ExportNamedDeclaration?: VisitNode<t.ExportNamedDeclaration>;
        Declaration?: VisitNode<t.Declaration>;
        ExportSpecifier?: VisitNode<t.ExportSpecifier>;
        ForOfStatement?: VisitNode<t.ForOfStatement>;
        ImportDeclaration?: VisitNode<t.ImportDeclaration>;
        ImportDefaultSpecifier?: VisitNode<t.ImportDefaultSpecifier>;
        ImportNamespaceSpecifier?: VisitNode<t.ImportNamespaceSpecifier>;
        ImportSpecifier?: VisitNode<t.ImportSpecifier>;
        MetaProperty?: VisitNode<t.MetaProperty>;
        ClassMethod?: VisitNode<t.ClassMethod>;
        ObjectPattern?: VisitNode<t.ObjectPattern>;
        SpreadElement?: VisitNode<t.SpreadElement>;
        Super?: VisitNode<t.Super>;
        TaggedTemplateExpression?: VisitNode<t.TaggedTemplateExpression>;
        TemplateLiteral?: VisitNode<t.TemplateLiteral>;
        TemplateElement?: VisitNode<t.TemplateElement>;
        YieldExpression?: VisitNode<t.YieldExpression>;
        AnyTypeAnnotation?: VisitNode<t.AnyTypeAnnotation>;
        ArrayTypeAnnotation?: VisitNode<t.ArrayTypeAnnotation>;
        BooleanTypeAnnotation?: VisitNode<t.BooleanTypeAnnotation>;
        BooleanLiteralTypeAnnotation?: VisitNode<t.BooleanLiteralTypeAnnotation>;
        NullLiteralTypeAnnotation?: VisitNode<t.NullLiteralTypeAnnotation>;
        ClassImplements?: VisitNode<t.ClassImplements>;
        ClassProperty?: VisitNode<t.ClassProperty>;
        DeclareClass?: VisitNode<t.DeclareClass>;
        DeclareFunction?: VisitNode<t.DeclareFunction>;
        DeclareInterface?: VisitNode<t.DeclareInterface>;
        DeclareModule?: VisitNode<t.DeclareModule>;
        DeclareTypeAlias?: VisitNode<t.DeclareTypeAlias>;
        DeclareVariable?: VisitNode<t.DeclareVariable>;
        ExistentialTypeParam?: VisitNode<t.ExistentialTypeParam>;
        FunctionTypeAnnotation?: VisitNode<t.FunctionTypeAnnotation>;
        FunctionTypeParam?: VisitNode<t.FunctionTypeParam>;
        GenericTypeAnnotation?: VisitNode<t.GenericTypeAnnotation>;
        InterfaceExtends?: VisitNode<t.InterfaceExtends>;
        InterfaceDeclaration?: VisitNode<t.InterfaceDeclaration>;
        IntersectionTypeAnnotation?: VisitNode<t.IntersectionTypeAnnotation>;
        MixedTypeAnnotation?: VisitNode<t.MixedTypeAnnotation>;
        NullableTypeAnnotation?: VisitNode<t.NullableTypeAnnotation>;
        NumericLiteralTypeAnnotation?: VisitNode<t.NumericLiteralTypeAnnotation>;
        NumberTypeAnnotation?: VisitNode<t.NumberTypeAnnotation>;
        StringLiteralTypeAnnotation?: VisitNode<t.StringLiteralTypeAnnotation>;
        StringTypeAnnotation?: VisitNode<t.StringTypeAnnotation>;
        ThisTypeAnnotation?: VisitNode<t.ThisTypeAnnotation>;
        TupleTypeAnnotation?: VisitNode<t.TupleTypeAnnotation>;
        TypeofTypeAnnotation?: VisitNode<t.TypeofTypeAnnotation>;
        TypeAlias?: VisitNode<t.TypeAlias>;
        TypeAnnotation?: VisitNode<t.TypeAnnotation>;
        TypeCastExpression?: VisitNode<t.TypeCastExpression>;
        TypeParameterDeclaration?: VisitNode<t.TypeParameterDeclaration>;
        TypeParameterInstantiation?: VisitNode<t.TypeParameterInstantiation>;
        ObjectTypeAnnotation?: VisitNode<t.ObjectTypeAnnotation>;
        ObjectTypeCallProperty?: VisitNode<t.ObjectTypeCallProperty>;
        ObjectTypeIndexer?: VisitNode<t.ObjectTypeIndexer>;
        ObjectTypeProperty?: VisitNode<t.ObjectTypeProperty>;
        QualifiedTypeIdentifier?: VisitNode<t.QualifiedTypeIdentifier>;
        UnionTypeAnnotation?: VisitNode<t.UnionTypeAnnotation>;
        VoidTypeAnnotation?: VisitNode<t.VoidTypeAnnotation>;
        JSXAttribute?: VisitNode<t.JSXAttribute>;
        JSXIdentifier?: VisitNode<t.JSXIdentifier>;
        JSXNamespacedName?: VisitNode<t.JSXNamespacedName>;
        JSXElement?: VisitNode<t.JSXElement>;
        JSXExpressionContainer?: VisitNode<t.JSXExpressionContainer>;
        JSXClosingElement?: VisitNode<t.JSXClosingElement>;
        JSXMemberExpression?: VisitNode<t.JSXMemberExpression>;
        JSXOpeningElement?: VisitNode<t.JSXOpeningElement>;
        JSXEmptyExpression?: VisitNode<t.JSXEmptyExpression>;
        JSXSpreadAttribute?: VisitNode<t.JSXSpreadAttribute>;
        JSXText?: VisitNode<t.JSXText>;
        Noop?: VisitNode<t.Noop>;
        ParenthesizedExpression?: VisitNode<t.ParenthesizedExpression>;
        AwaitExpression?: VisitNode<t.AwaitExpression>;
        BindExpression?: VisitNode<t.BindExpression>;
        Decorator?: VisitNode<t.Decorator>;
        DoExpression?: VisitNode<t.DoExpression>;
        ExportDefaultSpecifier?: VisitNode<t.ExportDefaultSpecifier>;
        ExportNamespaceSpecifier?: VisitNode<t.ExportNamespaceSpecifier>;
        RestProperty?: VisitNode<t.RestProperty>;
        SpreadProperty?: VisitNode<t.SpreadProperty>;
        Binary?: VisitNode<t.Binary>;
        Scopable?: VisitNode<t.Scopable>;
        BlockParent?: VisitNode<t.BlockParent>;
        Block?: VisitNode<t.Block>;
        Terminatorless?: VisitNode<t.Terminatorless>;
        CompletionStatement?: VisitNode<t.CompletionStatement>;
        Conditional?: VisitNode<t.Conditional>;
        Loop?: VisitNode<t.Loop>;
        While?: VisitNode<t.While>;
        ExpressionWrapper?: VisitNode<t.ExpressionWrapper>;
        For?: VisitNode<t.For>;
        ForXStatement?: VisitNode<t.ForXStatement>;
        Function?: VisitNode<t.Function>;
        FunctionParent?: VisitNode<t.FunctionParent>;
        Pureish?: VisitNode<t.Pureish>;
        Literal?: VisitNode<t.Literal>;
        Immutable?: VisitNode<t.Immutable>;
        UserWhitespacable?: VisitNode<t.UserWhitespacable>;
        Method?: VisitNode<t.Method>;
        ObjectMember?: VisitNode<t.ObjectMember>;
        Property?: VisitNode<t.Property>;
        UnaryLike?: VisitNode<t.UnaryLike>;
        Pattern?: VisitNode<t.Pattern>;
        Class?: VisitNode<t.Class>;
        ModuleDeclaration?: VisitNode<t.ModuleDeclaration>;
        ExportDeclaration?: VisitNode<t.ExportDeclaration>;
        ModuleSpecifier?: VisitNode<t.ModuleSpecifier>;
        Flow?: VisitNode<t.Flow>;
        FlowBaseAnnotation?: VisitNode<t.FlowBaseAnnotation>;
        FlowDeclaration?: VisitNode<t.FlowDeclaration>;
        JSX?: VisitNode<t.JSX>;
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
