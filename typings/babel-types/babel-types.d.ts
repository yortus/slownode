// How this file was created:
// 01. start with contents of babel/lib/types.js
// 02. replace double-spaces with quad-spaces
// 03. replace 'declare class' with 'interface'
// 04. replace 'declare function' with 'export function'
// 05. fix nullable syntax:
//      - regex find: \?([a-z<>\[\] |]+)
//      - ...replace: $1 | null | undefined
// 06. change `BabelNodeXXX` interface naming:
//      - regex find: BabelNode([a-z]*)
//      - ...replace: $1Node
// 07. fix required params after optional params (see remaining red squiggles)
//      - replace (p1?: T1, p2: T2) with (p1: T1 | undefined, p2: T2)
// 08. fix `Node` interface declaration:
//      - add 'type: string' property
//      - make xxxComments properties optional and remove | null | undefined from their RHS
// 09. turn isXXX() functions into type guards:
//      - regex find: export function is([a-z]+)\(([^)]*)\)\: boolean;
//      - ...replace: export function is$1($2): node is $1Node;
//      - fix non-node isXXX() function towards the end (see remaining red squiggles)
// 10. add assertXXX() functions:
//      - paste a copy of all the isXXX() functions below the originals
//      - select the copies and find/replace in selection:
//      - regex find: export function is([a-z]+)\([^)]*\)\: node is \1Node;
//      - ...replace: export function assert$1(node: Object, opts?: Object): void;
// 11. wrap whole file inside `declare module "babel-types" {...}`
//      - interface --> export interface
//      - type --> export type (careful: don't change `type` properties in interfaces!)
//      - fix indenting
// 12. manual tweaks:
//      - change type annotation: IdentifierNode { name: string }


declare module "babel-types" {

    export interface CommentNode {
        value: string;
        start: number;
        end: number;
        loc: SourceLocationNode;
    }

    export interface BlockCommentNode extends CommentNode {
        type: "BlockComment";
    }

    export interface LineCommentNode extends CommentNode {
        type: "LineComment";
    }

    export interface SourceLocationNode {
        start: {
            line: number;
            column: number;
        };

        end: {
            line: number;
            column: number;
        };
    }

    export interface Node {
        type: string;
        leadingComments?: Array<CommentNode>;
        innerComments?: Array<CommentNode>;
        trailingComments?: Array<CommentNode>;
        start: number | null | undefined;
        end: number | null | undefined;
        loc: SourceLocationNode | null | undefined;
    }

    export interface ArrayExpressionNode extends Node {
        type: "ArrayExpression";
        elements?: any;
    }

    export interface AssignmentExpressionNode extends Node {
        type: "AssignmentExpression";
        operator: string;
        left: LValNode;
        right: ExpressionNode;
    }

    export interface BinaryExpressionNode extends Node {
        type: "BinaryExpression";
        operator: "+" | "-" | "/" | "%" | "*" | "**" | "&" | "|" | ">>" | ">>>" | "<<" | "^" | "==" | "===" | "!=" | "!==" | "in" | "instanceof" | ">" | "<" | ">=" | "<=";
        left: ExpressionNode;
        right: ExpressionNode;
    }

    export interface DirectiveNode extends Node {
        type: "Directive";
        value: DirectiveLiteralNode;
    }

    export interface DirectiveLiteralNode extends Node {
        type: "DirectiveLiteral";
        value: string;
    }

    export interface BlockStatementNode extends Node {
        type: "BlockStatement";
        directives?: any;
        body: any;
    }

    export interface BreakStatementNode extends Node {
        type: "BreakStatement";
        label?: IdentifierNode | null | undefined;
    }

    export interface CallExpressionNode extends Node {
        type: "CallExpression";
        callee: ExpressionNode;
        arguments: any;
    }

    export interface CatchClauseNode extends Node {
        type: "CatchClause";
        param: IdentifierNode;
        body: BlockStatementNode;
    }

    export interface ConditionalExpressionNode extends Node {
        type: "ConditionalExpression";
        test: ExpressionNode;
        consequent: ExpressionNode;
        alternate: ExpressionNode;
    }

    export interface ContinueStatementNode extends Node {
        type: "ContinueStatement";
        label?: IdentifierNode | null | undefined;
    }

    export interface DebuggerStatementNode extends Node {
        type: "DebuggerStatement";
    }

    export interface DoWhileStatementNode extends Node {
        type: "DoWhileStatement";
        test: ExpressionNode;
        body: StatementNode;
    }

    export interface EmptyStatementNode extends Node {
        type: "EmptyStatement";
    }

    export interface ExpressionStatementNode extends Node {
        type: "ExpressionStatement";
        expression: ExpressionNode;
    }

    export interface FileNode extends Node {
        type: "File";
        program: ProgramNode;
        comments: any;
        tokens: any;
    }

    export interface ForInStatementNode extends Node {
        type: "ForInStatement";
        left: VariableDeclarationNode | LValNode;
        right: ExpressionNode;
        body: StatementNode;
    }

    export interface ForStatementNode extends Node {
        type: "ForStatement";
        init?: VariableDeclarationNode | ExpressionNode | null | undefined;
        test?: ExpressionNode | null | undefined;
        update?: ExpressionNode | null | undefined;
        body: StatementNode;
    }

    export interface FunctionDeclarationNode extends Node {
        type: "FunctionDeclaration";
        id: IdentifierNode;
        params: any;
        body: BlockStatementNode;
        generator?: boolean;
        async?: boolean;
        returnType: any;
        typeParameters: any;
    }

    export interface FunctionExpressionNode extends Node {
        type: "FunctionExpression";
        id?: IdentifierNode | null | undefined;
        params: any;
        body: BlockStatementNode;
        generator?: boolean;
        async?: boolean;
        returnType: any;
        typeParameters: any;
    }

    export interface IdentifierNode extends Node {
        type: "Identifier";
        name: string;
        typeAnnotation: any;
    }

    export interface IfStatementNode extends Node {
        type: "IfStatement";
        test: ExpressionNode;
        consequent: StatementNode;
        alternate?: StatementNode | null | undefined;
    }

    export interface LabeledStatementNode extends Node {
        type: "LabeledStatement";
        label: IdentifierNode;
        body: StatementNode;
    }

    export interface StringLiteralNode extends Node {
        type: "StringLiteral";
        value: string;
    }

    export interface NumericLiteralNode extends Node {
        type: "NumericLiteral";
        value: number;
    }

    export interface NullLiteralNode extends Node {
        type: "NullLiteral";
    }

    export interface BooleanLiteralNode extends Node {
        type: "BooleanLiteral";
        value: boolean;
    }

    export interface RegExpLiteralNode extends Node {
        type: "RegExpLiteral";
        pattern: string;
        flags?: string;
    }

    export interface LogicalExpressionNode extends Node {
        type: "LogicalExpression";
        operator: "||" | "&&";
        left: ExpressionNode;
        right: ExpressionNode;
    }

    export interface MemberExpressionNode extends Node {
        type: "MemberExpression";
        object: ExpressionNode;
        property: any;
        computed?: boolean;
    }

    export interface NewExpressionNode extends Node {
        type: "NewExpression";
        callee: ExpressionNode;
        arguments: any;
    }

    export interface ProgramNode extends Node {
        type: "Program";
        directives?: any;
        body: any;
    }

    export interface ObjectExpressionNode extends Node {
        type: "ObjectExpression";
        properties: any;
    }

    export interface ObjectMethodNode extends Node {
        type: "ObjectMethod";
        kind?: any;
        computed?: boolean;
        key: any;
        decorators: any;
        body: BlockStatementNode;
        generator?: boolean;
        async?: boolean;
        params: any;
        returnType: any;
        typeParameters: any;
    }

    export interface ObjectPropertyNode extends Node {
        type: "ObjectProperty";
        computed?: boolean;
        key: any;
        value: ExpressionNode;
        shorthand?: boolean;
        decorators?: any;
    }

    export interface RestElementNode extends Node {
        type: "RestElement";
        argument: LValNode;
        typeAnnotation: any;
    }

    export interface ReturnStatementNode extends Node {
        type: "ReturnStatement";
        argument?: ExpressionNode | null | undefined;
    }

    export interface SequenceExpressionNode extends Node {
        type: "SequenceExpression";
        expressions: any;
    }

    export interface SwitchCaseNode extends Node {
        type: "SwitchCase";
        test?: ExpressionNode | null | undefined;
        consequent: any;
    }

    export interface SwitchStatementNode extends Node {
        type: "SwitchStatement";
        discriminant: ExpressionNode;
        cases: any;
    }

    export interface ThisExpressionNode extends Node {
        type: "ThisExpression";
    }

    export interface ThrowStatementNode extends Node {
        type: "ThrowStatement";
        argument: ExpressionNode;
    }

    export interface TryStatementNode extends Node {
        type: "TryStatement";
        body: BlockStatementNode;
        handler?: any;
        finalizer?: BlockStatementNode | null | undefined;
        block: any;
    }

    export interface UnaryExpressionNode extends Node {
        type: "UnaryExpression";
        prefix?: boolean;
        argument: ExpressionNode;
        operator: "void" | "delete" | "!" | "+" | "-" | "++" | "--" | "~" | "typeof";
    }

    export interface UpdateExpressionNode extends Node {
        type: "UpdateExpression";
        prefix?: boolean;
        argument: ExpressionNode;
        operator: "++" | "--";
    }

    export interface VariableDeclarationNode extends Node {
        type: "VariableDeclaration";
        kind: any;
        declarations: any;
    }

    export interface VariableDeclaratorNode extends Node {
        type: "VariableDeclarator";
        id: LValNode;
        init?: ExpressionNode | null | undefined;
    }

    export interface WhileStatementNode extends Node {
        type: "WhileStatement";
        test: ExpressionNode;
        body: BlockStatementNode | StatementNode;
    }

    export interface WithStatementNode extends Node {
        type: "WithStatement";
        object: any;
        body: BlockStatementNode | StatementNode;
    }

    export interface AssignmentPatternNode extends Node {
        type: "AssignmentPattern";
        left: IdentifierNode;
        right: ExpressionNode;
    }

    export interface ArrayPatternNode extends Node {
        type: "ArrayPattern";
        elements: any;
        typeAnnotation: any;
    }

    export interface ArrowFunctionExpressionNode extends Node {
        type: "ArrowFunctionExpression";
        params: any;
        body: BlockStatementNode | ExpressionNode;
        async?: boolean;
        returnType: any;
    }

    export interface ClassBodyNode extends Node {
        type: "ClassBody";
        body: any;
    }

    export interface ClassDeclarationNode extends Node {
        type: "ClassDeclaration";
        id: IdentifierNode;
        body: ClassBodyNode;
        superClass?: ExpressionNode | null | undefined;
        decorators: any;
        mixins: any;
        typeParameters: any;
        superTypeParameters: any;
    }

    export interface ClassExpressionNode extends Node {
        type: "ClassExpression";
        id?: IdentifierNode | null | undefined;
        body: ClassBodyNode;
        superClass?: ExpressionNode | null | undefined;
        decorators: any;
        mixins: any;
        typeParameters: any;
        superTypeParameters: any;
    }

    export interface ExportAllDeclarationNode extends Node {
        type: "ExportAllDeclaration";
        source: StringLiteralNode;
    }

    export interface ExportDefaultDeclarationNode extends Node {
        type: "ExportDefaultDeclaration";
        declaration: FunctionDeclarationNode | ClassDeclarationNode | ExpressionNode;
    }

    export interface ExportNamedDeclarationNode extends Node {
        type: "ExportNamedDeclaration";
        declaration?: DeclarationNode | null | undefined;
        specifiers: any;
        source?: StringLiteralNode | null | undefined;
    }

    export interface ExportSpecifierNode extends Node {
        type: "ExportSpecifier";
        local: IdentifierNode;
        imported: IdentifierNode;
        exported: any;
    }

    export interface ForOfStatementNode extends Node {
        type: "ForOfStatement";
        left: VariableDeclarationNode | LValNode;
        right: ExpressionNode;
        body: StatementNode;
    }

    export interface ImportDeclarationNode extends Node {
        type: "ImportDeclaration";
        specifiers: any;
        source: StringLiteralNode;
    }

    export interface ImportDefaultSpecifierNode extends Node {
        type: "ImportDefaultSpecifier";
        local: IdentifierNode;
    }

    export interface ImportNamespaceSpecifierNode extends Node {
        type: "ImportNamespaceSpecifier";
        local: IdentifierNode;
    }

    export interface ImportSpecifierNode extends Node {
        type: "ImportSpecifier";
        local: IdentifierNode;
        imported: IdentifierNode;
    }

    export interface MetaPropertyNode extends Node {
        type: "MetaProperty";
        meta: string;
        property: string;
    }

    export interface ClassMethodNode extends Node {
        type: "ClassMethod";
        kind?: any;
        computed?: boolean;
        key: any;
        params: any;
        body: BlockStatementNode;
        generator?: boolean;
        async?: boolean;
        decorators: any;
        returnType: any;
        typeParameters: any;
    }

    export interface ObjectPatternNode extends Node {
        type: "ObjectPattern";
        properties: any;
        typeAnnotation: any;
    }

    export interface SpreadElementNode extends Node {
        type: "SpreadElement";
        argument: ExpressionNode;
    }

    export interface SuperNode extends Node {
        type: "Super";
    }

    export interface TaggedTemplateExpressionNode extends Node {
        type: "TaggedTemplateExpression";
        tag: ExpressionNode;
        quasi: TemplateLiteralNode;
    }

    export interface TemplateElementNode extends Node {
        type: "TemplateElement";
        value: any;
        tail?: boolean;
    }

    export interface TemplateLiteralNode extends Node {
        type: "TemplateLiteral";
        quasis: any;
        expressions: any;
    }

    export interface YieldExpressionNode extends Node {
        type: "YieldExpression";
        delegate?: boolean;
        argument?: ExpressionNode | null | undefined;
    }

    export interface AnyTypeAnnotationNode extends Node {
        type: "AnyTypeAnnotation";
    }

    export interface ArrayTypeAnnotationNode extends Node {
        type: "ArrayTypeAnnotation";
        elementType: any;
    }

    export interface BooleanTypeAnnotationNode extends Node {
        type: "BooleanTypeAnnotation";
    }

    export interface BooleanLiteralTypeAnnotationNode extends Node {
        type: "BooleanLiteralTypeAnnotation";
    }

    export interface NullLiteralTypeAnnotationNode extends Node {
        type: "NullLiteralTypeAnnotation";
    }

    export interface ClassImplementsNode extends Node {
        type: "ClassImplements";
        id: any;
        typeParameters: any;
    }

    export interface ClassPropertyNode extends Node {
        type: "ClassProperty";
        key: any;
        value: any;
        typeAnnotation: any;
        decorators: any;
    }

    export interface DeclareClassNode extends Node {
        type: "DeclareClass";
        id: any;
        typeParameters: any;
        body: any;
    }

    export interface DeclareFunctionNode extends Node {
        type: "DeclareFunction";
        id: any;
    }

    export interface DeclareInterfaceNode extends Node {
        type: "DeclareInterface";
        id: any;
        typeParameters: any;
        body: any;
    }

    export interface DeclareModuleNode extends Node {
        type: "DeclareModule";
        id: any;
        body: any;
    }

    export interface DeclareTypeAliasNode extends Node {
        type: "DeclareTypeAlias";
        id: any;
        typeParameters: any;
        right: any;
    }

    export interface DeclareVariableNode extends Node {
        type: "DeclareVariable";
        id: any;
    }

    export interface ExistentialTypeParamNode extends Node {
        type: "ExistentialTypeParam";
    }

    export interface FunctionTypeAnnotationNode extends Node {
        type: "FunctionTypeAnnotation";
        typeParameters: any;
        params: any;
        rest: any;
        returnType: any;
    }

    export interface FunctionTypeParamNode extends Node {
        type: "FunctionTypeParam";
        name: any;
        typeAnnotation: any;
    }

    export interface GenericTypeAnnotationNode extends Node {
        type: "GenericTypeAnnotation";
        id: any;
        typeParameters: any;
    }

    export interface InterfaceExtendsNode extends Node {
        type: "InterfaceExtends";
        id: any;
        typeParameters: any;
    }

    export interface InterfaceDeclarationNode extends Node {
        type: "InterfaceDeclaration";
        id: any;
        typeParameters: any;
        body: any;
    }

    export interface IntersectionTypeAnnotationNode extends Node {
        type: "IntersectionTypeAnnotation";
        types: any;
    }

    export interface MixedTypeAnnotationNode extends Node {
        type: "MixedTypeAnnotation";
    }

    export interface NullableTypeAnnotationNode extends Node {
        type: "NullableTypeAnnotation";
        typeAnnotation: any;
    }

    export interface NumericLiteralTypeAnnotationNode extends Node {
        type: "NumericLiteralTypeAnnotation";
    }

    export interface NumberTypeAnnotationNode extends Node {
        type: "NumberTypeAnnotation";
    }

    export interface StringLiteralTypeAnnotationNode extends Node {
        type: "StringLiteralTypeAnnotation";
    }

    export interface StringTypeAnnotationNode extends Node {
        type: "StringTypeAnnotation";
    }

    export interface ThisTypeAnnotationNode extends Node {
        type: "ThisTypeAnnotation";
    }

    export interface TupleTypeAnnotationNode extends Node {
        type: "TupleTypeAnnotation";
        types: any;
    }

    export interface TypeofTypeAnnotationNode extends Node {
        type: "TypeofTypeAnnotation";
        argument: any;
    }

    export interface TypeAliasNode extends Node {
        type: "TypeAlias";
        id: any;
        typeParameters: any;
        right: any;
    }

    export interface TypeAnnotationNode extends Node {
        type: "TypeAnnotation";
        typeAnnotation: any;
    }

    export interface TypeCastExpressionNode extends Node {
        type: "TypeCastExpression";
        expression: any;
        typeAnnotation: any;
    }

    export interface TypeParameterDeclarationNode extends Node {
        type: "TypeParameterDeclaration";
        params: any;
    }

    export interface TypeParameterInstantiationNode extends Node {
        type: "TypeParameterInstantiation";
        params: any;
    }

    export interface ObjectTypeAnnotationNode extends Node {
        type: "ObjectTypeAnnotation";
        properties: any;
        indexers: any;
        callProperties: any;
    }

    export interface ObjectTypeCallPropertyNode extends Node {
        type: "ObjectTypeCallProperty";
        value: any;
    }

    export interface ObjectTypeIndexerNode extends Node {
        type: "ObjectTypeIndexer";
        id: any;
        key: any;
        value: any;
    }

    export interface ObjectTypePropertyNode extends Node {
        type: "ObjectTypeProperty";
        key: any;
        value: any;
    }

    export interface QualifiedTypeIdentifierNode extends Node {
        type: "QualifiedTypeIdentifier";
        id: any;
        qualification: any;
    }

    export interface UnionTypeAnnotationNode extends Node {
        type: "UnionTypeAnnotation";
        types: any;
    }

    export interface VoidTypeAnnotationNode extends Node {
        type: "VoidTypeAnnotation";
    }

    export interface JSXAttributeNode extends Node {
        type: "JSXAttribute";
        name: JSXIdentifierNode | JSXNamespacedNameNode;
        value?: JSXElementNode | StringLiteralNode | JSXExpressionContainerNode | null | undefined;
    }

    export interface JSXClosingElementNode extends Node {
        type: "JSXClosingElement";
        name: JSXIdentifierNode | JSXMemberExpressionNode;
    }

    export interface JSXElementNode extends Node {
        type: "JSXElement";
        openingElement: JSXOpeningElementNode;
        closingElement?: JSXClosingElementNode | null | undefined;
        children: any;
        selfClosing: any;
    }

    export interface JSXEmptyExpressionNode extends Node {
        type: "JSXEmptyExpression";
    }

    export interface JSXExpressionContainerNode extends Node {
        type: "JSXExpressionContainer";
        expression: ExpressionNode;
    }

    export interface JSXIdentifierNode extends Node {
        type: "JSXIdentifier";
        name: string;
    }

    export interface JSXMemberExpressionNode extends Node {
        type: "JSXMemberExpression";
        object: JSXMemberExpressionNode | JSXIdentifierNode;
        property: JSXIdentifierNode;
    }

    export interface JSXNamespacedNameNode extends Node {
        type: "JSXNamespacedName";
        namespace: JSXIdentifierNode;
        name: JSXIdentifierNode;
    }

    export interface JSXOpeningElementNode extends Node {
        type: "JSXOpeningElement";
        name: JSXIdentifierNode | JSXMemberExpressionNode;
        selfClosing?: boolean;
        attributes: any;
    }

    export interface JSXSpreadAttributeNode extends Node {
        type: "JSXSpreadAttribute";
        argument: ExpressionNode;
    }

    export interface JSXTextNode extends Node {
        type: "JSXText";
        value: string;
    }

    export interface NoopNode extends Node {
        type: "Noop";
    }

    export interface ParenthesizedExpressionNode extends Node {
        type: "ParenthesizedExpression";
        expression: ExpressionNode;
    }

    export interface AwaitExpressionNode extends Node {
        type: "AwaitExpression";
        argument: ExpressionNode;
    }

    export interface BindExpressionNode extends Node {
        type: "BindExpression";
        object: any;
        callee: any;
    }

    export interface DecoratorNode extends Node {
        type: "Decorator";
        expression: ExpressionNode;
    }

    export interface DoExpressionNode extends Node {
        type: "DoExpression";
        body: BlockStatementNode;
    }

    export interface ExportDefaultSpecifierNode extends Node {
        type: "ExportDefaultSpecifier";
        exported: IdentifierNode;
    }

    export interface ExportNamespaceSpecifierNode extends Node {
        type: "ExportNamespaceSpecifier";
        exported: IdentifierNode;
    }

    export interface RestPropertyNode extends Node {
        type: "RestProperty";
        argument: LValNode;
    }

    export interface SpreadPropertyNode extends Node {
        type: "SpreadProperty";
        argument: ExpressionNode;
    }

    export type ExpressionNode = ArrayExpressionNode | AssignmentExpressionNode | BinaryExpressionNode | CallExpressionNode | ConditionalExpressionNode | FunctionExpressionNode | IdentifierNode | StringLiteralNode | NumericLiteralNode | NullLiteralNode | BooleanLiteralNode | RegExpLiteralNode | LogicalExpressionNode | MemberExpressionNode | NewExpressionNode | ObjectExpressionNode | SequenceExpressionNode | ThisExpressionNode | UnaryExpressionNode | UpdateExpressionNode | ArrowFunctionExpressionNode | ClassExpressionNode | MetaPropertyNode | SuperNode | TaggedTemplateExpressionNode | TemplateLiteralNode | YieldExpressionNode | TypeCastExpressionNode | JSXElementNode | JSXEmptyExpressionNode | JSXIdentifierNode | JSXMemberExpressionNode | ParenthesizedExpressionNode | AwaitExpressionNode | BindExpressionNode | DoExpressionNode;
    export type BinaryNode = BinaryExpressionNode | LogicalExpressionNode;
    export type ScopableNode = BlockStatementNode | CatchClauseNode | DoWhileStatementNode | ForInStatementNode | ForStatementNode | FunctionDeclarationNode | FunctionExpressionNode | ProgramNode | ObjectMethodNode | SwitchStatementNode | WhileStatementNode | ArrowFunctionExpressionNode | ClassDeclarationNode | ClassExpressionNode | ForOfStatementNode | ClassMethodNode;
    export type BlockParentNode = BlockStatementNode | DoWhileStatementNode | ForInStatementNode | ForStatementNode | FunctionDeclarationNode | FunctionExpressionNode | ProgramNode | ObjectMethodNode | SwitchStatementNode | WhileStatementNode | ArrowFunctionExpressionNode | ForOfStatementNode | ClassMethodNode;
    export type BlockNode = BlockStatementNode | ProgramNode;
    export type StatementNode = BlockStatementNode | BreakStatementNode | ContinueStatementNode | DebuggerStatementNode | DoWhileStatementNode | EmptyStatementNode | ExpressionStatementNode | ForInStatementNode | ForStatementNode | FunctionDeclarationNode | IfStatementNode | LabeledStatementNode | ReturnStatementNode | SwitchStatementNode | ThrowStatementNode | TryStatementNode | VariableDeclarationNode | WhileStatementNode | WithStatementNode | ClassDeclarationNode | ExportAllDeclarationNode | ExportDefaultDeclarationNode | ExportNamedDeclarationNode | ForOfStatementNode | ImportDeclarationNode | DeclareClassNode | DeclareFunctionNode | DeclareInterfaceNode | DeclareModuleNode | DeclareTypeAliasNode | DeclareVariableNode | InterfaceDeclarationNode | TypeAliasNode;
    export type TerminatorlessNode = BreakStatementNode | ContinueStatementNode | ReturnStatementNode | ThrowStatementNode | YieldExpressionNode | AwaitExpressionNode;
    export type CompletionStatementNode = BreakStatementNode | ContinueStatementNode | ReturnStatementNode | ThrowStatementNode;
    export type ConditionalNode = ConditionalExpressionNode | IfStatementNode;
    export type LoopNode = DoWhileStatementNode | ForInStatementNode | ForStatementNode | WhileStatementNode | ForOfStatementNode;
    export type WhileNode = DoWhileStatementNode | WhileStatementNode;
    export type ExpressionWrapperNode = ExpressionStatementNode | TypeCastExpressionNode | ParenthesizedExpressionNode;
    export type ForNode = ForInStatementNode | ForStatementNode | ForOfStatementNode;
    export type ForXStatementNode = ForInStatementNode | ForOfStatementNode;
    export type FunctionNode = FunctionDeclarationNode | FunctionExpressionNode | ObjectMethodNode | ArrowFunctionExpressionNode | ClassMethodNode;
    export type FunctionParentNode = FunctionDeclarationNode | FunctionExpressionNode | ProgramNode | ObjectMethodNode | ArrowFunctionExpressionNode | ClassMethodNode;
    export type PureishNode = FunctionDeclarationNode | FunctionExpressionNode | StringLiteralNode | NumericLiteralNode | NullLiteralNode | BooleanLiteralNode | ArrowFunctionExpressionNode | ClassDeclarationNode | ClassExpressionNode;
    export type DeclarationNode = FunctionDeclarationNode | VariableDeclarationNode | ClassDeclarationNode | ExportAllDeclarationNode | ExportDefaultDeclarationNode | ExportNamedDeclarationNode | ImportDeclarationNode | DeclareClassNode | DeclareFunctionNode | DeclareInterfaceNode | DeclareModuleNode | DeclareTypeAliasNode | DeclareVariableNode | InterfaceDeclarationNode | TypeAliasNode;
    export type LValNode = IdentifierNode | MemberExpressionNode | RestElementNode | AssignmentPatternNode | ArrayPatternNode | ObjectPatternNode;
    export type LiteralNode = StringLiteralNode | NumericLiteralNode | NullLiteralNode | BooleanLiteralNode | RegExpLiteralNode | TemplateLiteralNode;
    export type ImmutableNode = StringLiteralNode | NumericLiteralNode | NullLiteralNode | BooleanLiteralNode | JSXAttributeNode | JSXClosingElementNode | JSXElementNode | JSXExpressionContainerNode | JSXOpeningElementNode;
    export type UserWhitespacableNode = ObjectMethodNode | ObjectPropertyNode | ObjectTypeCallPropertyNode | ObjectTypeIndexerNode | ObjectTypePropertyNode;
    export type MethodNode = ObjectMethodNode | ClassMethodNode;
    export type ObjectMemberNode = ObjectMethodNode | ObjectPropertyNode;
    export type PropertyNode = ObjectPropertyNode | ClassPropertyNode;
    export type UnaryLikeNode = UnaryExpressionNode | SpreadElementNode | RestPropertyNode | SpreadPropertyNode;
    export type PatternNode = AssignmentPatternNode | ArrayPatternNode | ObjectPatternNode;
    export type ClassNode = ClassDeclarationNode | ClassExpressionNode;
    export type ModuleDeclarationNode = ExportAllDeclarationNode | ExportDefaultDeclarationNode | ExportNamedDeclarationNode | ImportDeclarationNode;
    export type ExportDeclarationNode = ExportAllDeclarationNode | ExportDefaultDeclarationNode | ExportNamedDeclarationNode;
    export type ModuleSpecifierNode = ExportSpecifierNode | ImportDefaultSpecifierNode | ImportNamespaceSpecifierNode | ImportSpecifierNode | ExportDefaultSpecifierNode | ExportNamespaceSpecifierNode;
    export type FlowNode = AnyTypeAnnotationNode | ArrayTypeAnnotationNode | BooleanTypeAnnotationNode | BooleanLiteralTypeAnnotationNode | NullLiteralTypeAnnotationNode | ClassImplementsNode | ClassPropertyNode | DeclareClassNode | DeclareFunctionNode | DeclareInterfaceNode | DeclareModuleNode | DeclareTypeAliasNode | DeclareVariableNode | ExistentialTypeParamNode | FunctionTypeAnnotationNode | FunctionTypeParamNode | GenericTypeAnnotationNode | InterfaceExtendsNode | InterfaceDeclarationNode | IntersectionTypeAnnotationNode | MixedTypeAnnotationNode | NullableTypeAnnotationNode | NumericLiteralTypeAnnotationNode | NumberTypeAnnotationNode | StringLiteralTypeAnnotationNode | StringTypeAnnotationNode | ThisTypeAnnotationNode | TupleTypeAnnotationNode | TypeofTypeAnnotationNode | TypeAliasNode | TypeAnnotationNode | TypeCastExpressionNode | TypeParameterDeclarationNode | TypeParameterInstantiationNode | ObjectTypeAnnotationNode | ObjectTypeCallPropertyNode | ObjectTypeIndexerNode | ObjectTypePropertyNode | QualifiedTypeIdentifierNode | UnionTypeAnnotationNode | VoidTypeAnnotationNode;
    export type FlowBaseAnnotationNode = AnyTypeAnnotationNode | BooleanTypeAnnotationNode | NullLiteralTypeAnnotationNode | MixedTypeAnnotationNode | NumberTypeAnnotationNode | StringTypeAnnotationNode | ThisTypeAnnotationNode | VoidTypeAnnotationNode;
    export type FlowDeclarationNode = DeclareClassNode | DeclareFunctionNode | DeclareInterfaceNode | DeclareModuleNode | DeclareTypeAliasNode | DeclareVariableNode | InterfaceDeclarationNode | TypeAliasNode;
    export type JSXNode = JSXAttributeNode | JSXClosingElementNode | JSXElementNode | JSXEmptyExpressionNode | JSXExpressionContainerNode | JSXIdentifierNode | JSXMemberExpressionNode | JSXNamespacedNameNode | JSXOpeningElementNode | JSXSpreadAttributeNode | JSXTextNode;

    export function arrayExpression(elements?: any): ArrayExpressionNode;
    export function assignmentExpression(operator: string, left: LValNode, right: ExpressionNode): AssignmentExpressionNode;
    export function binaryExpression(operator: "+" | "-" | "/" | "%" | "*" | "**" | "&" | "|" | ">>" | ">>>" | "<<" | "^" | "==" | "===" | "!=" | "!==" | "in" | "instanceof" | ">" | "<" | ">=" | "<=", left: ExpressionNode, right: ExpressionNode): BinaryExpressionNode;
    export function directive(value: DirectiveLiteralNode): DirectiveNode;
    export function directiveLiteral(value: string): DirectiveLiteralNode;
    export function blockStatement(directives: any, body: any): BlockStatementNode;
    export function breakStatement(label?: IdentifierNode | null | undefined): BreakStatementNode;
    export function callExpression(callee: ExpressionNode, _arguments: any): CallExpressionNode;
    export function catchClause(param: IdentifierNode, body: BlockStatementNode): CatchClauseNode;
    export function conditionalExpression(test: ExpressionNode, consequent: ExpressionNode, alternate: ExpressionNode): ConditionalExpressionNode;
    export function continueStatement(label?: IdentifierNode | null | undefined): ContinueStatementNode;
    export function debuggerStatement(): DebuggerStatementNode;
    export function doWhileStatement(test: ExpressionNode, body: StatementNode): DoWhileStatementNode;
    export function emptyStatement(): EmptyStatementNode;
    export function expressionStatement(expression: ExpressionNode): ExpressionStatementNode;
    export function file(program: ProgramNode, comments: any, tokens: any): FileNode;
    export function forInStatement(left: VariableDeclarationNode | LValNode, right: ExpressionNode, body: StatementNode): ForInStatementNode;
    export function forStatement(init: VariableDeclarationNode | ExpressionNode | null | undefined, test: ExpressionNode | null | undefined, update: ExpressionNode | null | undefined, body: StatementNode): ForStatementNode;
    export function functionDeclaration(id: IdentifierNode, params: any, body: BlockStatementNode, generator: boolean | undefined, async: boolean | undefined, returnType: any, typeParameters: any): FunctionDeclarationNode;
    export function functionExpression(id: IdentifierNode | null | undefined, params: any, body: BlockStatementNode, generator: boolean | undefined, async: boolean | undefined, returnType: any, typeParameters: any): FunctionExpressionNode;
    export function identifier(name: any, typeAnnotation: any): IdentifierNode;
    export function ifStatement(test: ExpressionNode, consequent: StatementNode, alternate?: StatementNode | null | undefined): IfStatementNode;
    export function labeledStatement(label: IdentifierNode, body: StatementNode): LabeledStatementNode;
    export function stringLiteral(value: string): StringLiteralNode;
    export function numericLiteral(value: number): NumericLiteralNode;
    export function nullLiteral(): NullLiteralNode;
    export function booleanLiteral(value: boolean): BooleanLiteralNode;
    export function regExpLiteral(pattern: string, flags?: string): RegExpLiteralNode;
    export function logicalExpression(operator: "||" | "&&", left: ExpressionNode, right: ExpressionNode): LogicalExpressionNode;
    export function memberExpression(object: ExpressionNode, property: any, computed?: boolean): MemberExpressionNode;
    export function newExpression(callee: ExpressionNode, _arguments: any): NewExpressionNode;
    export function program(directives: any, body: any): ProgramNode;
    export function objectExpression(properties: any): ObjectExpressionNode;
    export function objectMethod(kind: any, computed: boolean | undefined, key: any, decorators: any, body: BlockStatementNode, generator: boolean | undefined, async: boolean | undefined, params: any, returnType: any, typeParameters: any): ObjectMethodNode;
    export function objectProperty(computed: boolean | undefined, key: any, value: ExpressionNode, shorthand?: boolean, decorators?: any): ObjectPropertyNode;
    export function restElement(argument: LValNode, typeAnnotation: any): RestElementNode;
    export function returnStatement(argument?: ExpressionNode | null | undefined): ReturnStatementNode;
    export function sequenceExpression(expressions: any): SequenceExpressionNode;
    export function switchCase(test: ExpressionNode | null | undefined, consequent: any): SwitchCaseNode;
    export function switchStatement(discriminant: ExpressionNode, cases: any): SwitchStatementNode;
    export function thisExpression(): ThisExpressionNode;
    export function throwStatement(argument: ExpressionNode): ThrowStatementNode;
    export function tryStatement(body: BlockStatementNode, handler: any, finalizer: BlockStatementNode | null | undefined, block: any): TryStatementNode;
    export function unaryExpression(prefix: boolean | undefined, argument: ExpressionNode, operator: "void" | "delete" | "!" | "+" | "-" | "++" | "--" | "~" | "typeof"): UnaryExpressionNode;
    export function updateExpression(prefix: boolean | undefined, argument: ExpressionNode, operator: "++" | "--"): UpdateExpressionNode;
    export function variableDeclaration(kind: any, declarations: any): VariableDeclarationNode;
    export function variableDeclarator(id: LValNode, init?: ExpressionNode | null | undefined): VariableDeclaratorNode;
    export function whileStatement(test: ExpressionNode, body: BlockStatementNode | StatementNode): WhileStatementNode;
    export function withStatement(object: any, body: BlockStatementNode | StatementNode): WithStatementNode;
    export function assignmentPattern(left: IdentifierNode, right: ExpressionNode): AssignmentPatternNode;
    export function arrayPattern(elements: any, typeAnnotation: any): ArrayPatternNode;
    export function arrowFunctionExpression(params: any, body: BlockStatementNode | ExpressionNode, async: boolean | undefined, returnType: any): ArrowFunctionExpressionNode;
    export function classBody(body: any): ClassBodyNode;
    export function classDeclaration(id: IdentifierNode, body: ClassBodyNode, superClass: ExpressionNode | null | undefined, decorators: any, mixins: any, typeParameters: any, superTypeParameters: any, _implements: any): ClassDeclarationNode;
    export function classExpression(id: IdentifierNode | null | undefined, body: ClassBodyNode, superClass: ExpressionNode | null | undefined, decorators: any, mixins: any, typeParameters: any, superTypeParameters: any, _implements: any): ClassExpressionNode;
    export function exportAllDeclaration(source: StringLiteralNode): ExportAllDeclarationNode;
    export function exportDefaultDeclaration(declaration: FunctionDeclarationNode | ClassDeclarationNode | ExpressionNode): ExportDefaultDeclarationNode;
    export function exportNamedDeclaration(declaration: DeclarationNode | null | undefined, specifiers: any, source?: StringLiteralNode | null | undefined): ExportNamedDeclarationNode;
    export function exportSpecifier(local: IdentifierNode, imported: IdentifierNode, exported: any): ExportSpecifierNode;
    export function forOfStatement(left: VariableDeclarationNode | LValNode, right: ExpressionNode, body: StatementNode): ForOfStatementNode;
    export function importDeclaration(specifiers: any, source: StringLiteralNode): ImportDeclarationNode;
    export function importDefaultSpecifier(local: IdentifierNode): ImportDefaultSpecifierNode;
    export function importNamespaceSpecifier(local: IdentifierNode): ImportNamespaceSpecifierNode;
    export function importSpecifier(local: IdentifierNode, imported: IdentifierNode): ImportSpecifierNode;
    export function metaProperty(meta: string, property: string): MetaPropertyNode;
    export function classMethod(kind: any, computed: boolean | undefined, _static: boolean | undefined, key: any, params: any, body: BlockStatementNode, generator: boolean | undefined, async: boolean | undefined, decorators: any, returnType: any, typeParameters: any): ClassMethodNode;
    export function objectPattern(properties: any, typeAnnotation: any): ObjectPatternNode;
    export function spreadElement(argument: ExpressionNode): SpreadElementNode;
    export function taggedTemplateExpression(tag: ExpressionNode, quasi: TemplateLiteralNode): TaggedTemplateExpressionNode;
    export function templateElement(value: any, tail?: boolean): TemplateElementNode;
    export function templateLiteral(quasis: any, expressions: any): TemplateLiteralNode;
    export function yieldExpression(delegate?: boolean, argument?: ExpressionNode | null | undefined): YieldExpressionNode;
    export function anyTypeAnnotation(): AnyTypeAnnotationNode;
    export function arrayTypeAnnotation(elementType: any): ArrayTypeAnnotationNode;
    export function booleanTypeAnnotation(): BooleanTypeAnnotationNode;
    export function booleanLiteralTypeAnnotation(): BooleanLiteralTypeAnnotationNode;
    export function nullLiteralTypeAnnotation(): NullLiteralTypeAnnotationNode;
    export function classImplements(id: any, typeParameters: any): ClassImplementsNode;
    export function classProperty(key: any, value: any, typeAnnotation: any, decorators: any): ClassPropertyNode;
    export function declareClass(id: any, typeParameters: any, _extends: any, body: any): DeclareClassNode;
    export function declareFunction(id: any): DeclareFunctionNode;
    export function declareInterface(id: any, typeParameters: any, _extends: any, body: any): DeclareInterfaceNode;
    export function declareModule(id: any, body: any): DeclareModuleNode;
    export function declareTypeAlias(id: any, typeParameters: any, right: any): DeclareTypeAliasNode;
    export function declareVariable(id: any): DeclareVariableNode;
    export function existentialTypeParam(): ExistentialTypeParamNode;
    export function functionTypeAnnotation(typeParameters: any, params: any, rest: any, returnType: any): FunctionTypeAnnotationNode;
    export function functionTypeParam(name: any, typeAnnotation: any): FunctionTypeParamNode;
    export function genericTypeAnnotation(id: any, typeParameters: any): GenericTypeAnnotationNode;
    export function interfaceExtends(id: any, typeParameters: any): InterfaceExtendsNode;
    export function interfaceDeclaration(id: any, typeParameters: any, _extends: any, body: any): InterfaceDeclarationNode;
    export function intersectionTypeAnnotation(types: any): IntersectionTypeAnnotationNode;
    export function mixedTypeAnnotation(): MixedTypeAnnotationNode;
    export function nullableTypeAnnotation(typeAnnotation: any): NullableTypeAnnotationNode;
    export function numericLiteralTypeAnnotation(): NumericLiteralTypeAnnotationNode;
    export function numberTypeAnnotation(): NumberTypeAnnotationNode;
    export function stringLiteralTypeAnnotation(): StringLiteralTypeAnnotationNode;
    export function stringTypeAnnotation(): StringTypeAnnotationNode;
    export function thisTypeAnnotation(): ThisTypeAnnotationNode;
    export function tupleTypeAnnotation(types: any): TupleTypeAnnotationNode;
    export function typeofTypeAnnotation(argument: any): TypeofTypeAnnotationNode;
    export function typeAlias(id: any, typeParameters: any, right: any): TypeAliasNode;
    export function typeAnnotation(typeAnnotation: any): TypeAnnotationNode;
    export function typeCastExpression(expression: any, typeAnnotation: any): TypeCastExpressionNode;
    export function typeParameterDeclaration(params: any): TypeParameterDeclarationNode;
    export function typeParameterInstantiation(params: any): TypeParameterInstantiationNode;
    export function objectTypeAnnotation(properties: any, indexers: any, callProperties: any): ObjectTypeAnnotationNode;
    export function objectTypeCallProperty(value: any): ObjectTypeCallPropertyNode;
    export function objectTypeIndexer(id: any, key: any, value: any): ObjectTypeIndexerNode;
    export function objectTypeProperty(key: any, value: any): ObjectTypePropertyNode;
    export function qualifiedTypeIdentifier(id: any, qualification: any): QualifiedTypeIdentifierNode;
    export function unionTypeAnnotation(types: any): UnionTypeAnnotationNode;
    export function voidTypeAnnotation(): VoidTypeAnnotationNode;
    export function jSXAttribute(name: JSXIdentifierNode | JSXNamespacedNameNode, value?: JSXElementNode | StringLiteralNode | JSXExpressionContainerNode | null | undefined): JSXAttributeNode;
    export function jSXClosingElement(name: JSXIdentifierNode | JSXMemberExpressionNode): JSXClosingElementNode;
    export function jSXElement(openingElement: JSXOpeningElementNode, closingElement: JSXClosingElementNode | null | undefined, children: any, selfClosing: any): JSXElementNode;
    export function jSXEmptyExpression(): JSXEmptyExpressionNode;
    export function jSXExpressionContainer(expression: ExpressionNode): JSXExpressionContainerNode;
    export function jSXIdentifier(name: string): JSXIdentifierNode;
    export function jSXMemberExpression(object: JSXMemberExpressionNode | JSXIdentifierNode, property: JSXIdentifierNode): JSXMemberExpressionNode;
    export function jSXNamespacedName(namespace: JSXIdentifierNode, name: JSXIdentifierNode): JSXNamespacedNameNode;
    export function jSXOpeningElement(name: JSXIdentifierNode | JSXMemberExpressionNode, selfClosing: boolean | undefined, attributes: any): JSXOpeningElementNode;
    export function jSXSpreadAttribute(argument: ExpressionNode): JSXSpreadAttributeNode;
    export function jSXText(value: string): JSXTextNode;
    export function noop(): NoopNode;
    export function parenthesizedExpression(expression: ExpressionNode): ParenthesizedExpressionNode;
    export function awaitExpression(argument: ExpressionNode): AwaitExpressionNode;
    export function bindExpression(object: any, callee: any): BindExpressionNode;
    export function decorator(expression: ExpressionNode): DecoratorNode;
    export function doExpression(body: BlockStatementNode): DoExpressionNode;
    export function exportDefaultSpecifier(exported: IdentifierNode): ExportDefaultSpecifierNode;
    export function exportNamespaceSpecifier(exported: IdentifierNode): ExportNamespaceSpecifierNode;
    export function restProperty(argument: LValNode): RestPropertyNode;
    export function spreadProperty(argument: ExpressionNode): SpreadPropertyNode;

    export function isArrayExpression(node: Object, opts?: Object): node is ArrayExpressionNode;
    export function isAssignmentExpression(node: Object, opts?: Object): node is AssignmentExpressionNode;
    export function isBinaryExpression(node: Object, opts?: Object): node is BinaryExpressionNode;
    export function isDirective(node: Object, opts?: Object): node is DirectiveNode;
    export function isDirectiveLiteral(node: Object, opts?: Object): node is DirectiveLiteralNode;
    export function isBlockStatement(node: Object, opts?: Object): node is BlockStatementNode;
    export function isBreakStatement(node: Object, opts?: Object): node is BreakStatementNode;
    export function isCallExpression(node: Object, opts?: Object): node is CallExpressionNode;
    export function isCatchClause(node: Object, opts?: Object): node is CatchClauseNode;
    export function isConditionalExpression(node: Object, opts?: Object): node is ConditionalExpressionNode;
    export function isContinueStatement(node: Object, opts?: Object): node is ContinueStatementNode;
    export function isDebuggerStatement(node: Object, opts?: Object): node is DebuggerStatementNode;
    export function isDoWhileStatement(node: Object, opts?: Object): node is DoWhileStatementNode;
    export function isEmptyStatement(node: Object, opts?: Object): node is EmptyStatementNode;
    export function isExpressionStatement(node: Object, opts?: Object): node is ExpressionStatementNode;
    export function isFile(node: Object, opts?: Object): node is FileNode;
    export function isForInStatement(node: Object, opts?: Object): node is ForInStatementNode;
    export function isForStatement(node: Object, opts?: Object): node is ForStatementNode;
    export function isFunctionDeclaration(node: Object, opts?: Object): node is FunctionDeclarationNode;
    export function isFunctionExpression(node: Object, opts?: Object): node is FunctionExpressionNode;
    export function isIdentifier(node: Object, opts?: Object): node is IdentifierNode;
    export function isIfStatement(node: Object, opts?: Object): node is IfStatementNode;
    export function isLabeledStatement(node: Object, opts?: Object): node is LabeledStatementNode;
    export function isStringLiteral(node: Object, opts?: Object): node is StringLiteralNode;
    export function isNumericLiteral(node: Object, opts?: Object): node is NumericLiteralNode;
    export function isNullLiteral(node: Object, opts?: Object): node is NullLiteralNode;
    export function isBooleanLiteral(node: Object, opts?: Object): node is BooleanLiteralNode;
    export function isRegExpLiteral(node: Object, opts?: Object): node is RegExpLiteralNode;
    export function isLogicalExpression(node: Object, opts?: Object): node is LogicalExpressionNode;
    export function isMemberExpression(node: Object, opts?: Object): node is MemberExpressionNode;
    export function isNewExpression(node: Object, opts?: Object): node is NewExpressionNode;
    export function isProgram(node: Object, opts?: Object): node is ProgramNode;
    export function isObjectExpression(node: Object, opts?: Object): node is ObjectExpressionNode;
    export function isObjectMethod(node: Object, opts?: Object): node is ObjectMethodNode;
    export function isObjectProperty(node: Object, opts?: Object): node is ObjectPropertyNode;
    export function isRestElement(node: Object, opts?: Object): node is RestElementNode;
    export function isReturnStatement(node: Object, opts?: Object): node is ReturnStatementNode;
    export function isSequenceExpression(node: Object, opts?: Object): node is SequenceExpressionNode;
    export function isSwitchCase(node: Object, opts?: Object): node is SwitchCaseNode;
    export function isSwitchStatement(node: Object, opts?: Object): node is SwitchStatementNode;
    export function isThisExpression(node: Object, opts?: Object): node is ThisExpressionNode;
    export function isThrowStatement(node: Object, opts?: Object): node is ThrowStatementNode;
    export function isTryStatement(node: Object, opts?: Object): node is TryStatementNode;
    export function isUnaryExpression(node: Object, opts?: Object): node is UnaryExpressionNode;
    export function isUpdateExpression(node: Object, opts?: Object): node is UpdateExpressionNode;
    export function isVariableDeclaration(node: Object, opts?: Object): node is VariableDeclarationNode;
    export function isVariableDeclarator(node: Object, opts?: Object): node is VariableDeclaratorNode;
    export function isWhileStatement(node: Object, opts?: Object): node is WhileStatementNode;
    export function isWithStatement(node: Object, opts?: Object): node is WithStatementNode;
    export function isAssignmentPattern(node: Object, opts?: Object): node is AssignmentPatternNode;
    export function isArrayPattern(node: Object, opts?: Object): node is ArrayPatternNode;
    export function isArrowFunctionExpression(node: Object, opts?: Object): node is ArrowFunctionExpressionNode;
    export function isClassBody(node: Object, opts?: Object): node is ClassBodyNode;
    export function isClassDeclaration(node: Object, opts?: Object): node is ClassDeclarationNode;
    export function isClassExpression(node: Object, opts?: Object): node is ClassExpressionNode;
    export function isExportAllDeclaration(node: Object, opts?: Object): node is ExportAllDeclarationNode;
    export function isExportDefaultDeclaration(node: Object, opts?: Object): node is ExportDefaultDeclarationNode;
    export function isExportNamedDeclaration(node: Object, opts?: Object): node is ExportNamedDeclarationNode;
    export function isExportSpecifier(node: Object, opts?: Object): node is ExportSpecifierNode;
    export function isForOfStatement(node: Object, opts?: Object): node is ForOfStatementNode;
    export function isImportDeclaration(node: Object, opts?: Object): node is ImportDeclarationNode;
    export function isImportDefaultSpecifier(node: Object, opts?: Object): node is ImportDefaultSpecifierNode;
    export function isImportNamespaceSpecifier(node: Object, opts?: Object): node is ImportNamespaceSpecifierNode;
    export function isImportSpecifier(node: Object, opts?: Object): node is ImportSpecifierNode;
    export function isMetaProperty(node: Object, opts?: Object): node is MetaPropertyNode;
    export function isClassMethod(node: Object, opts?: Object): node is ClassMethodNode;
    export function isObjectPattern(node: Object, opts?: Object): node is ObjectPatternNode;
    export function isSpreadElement(node: Object, opts?: Object): node is SpreadElementNode;
    export function isSuper(node: Object, opts?: Object): node is SuperNode;
    export function isTaggedTemplateExpression(node: Object, opts?: Object): node is TaggedTemplateExpressionNode;
    export function isTemplateElement(node: Object, opts?: Object): node is TemplateElementNode;
    export function isTemplateLiteral(node: Object, opts?: Object): node is TemplateLiteralNode;
    export function isYieldExpression(node: Object, opts?: Object): node is YieldExpressionNode;
    export function isAnyTypeAnnotation(node: Object, opts?: Object): node is AnyTypeAnnotationNode;
    export function isArrayTypeAnnotation(node: Object, opts?: Object): node is ArrayTypeAnnotationNode;
    export function isBooleanTypeAnnotation(node: Object, opts?: Object): node is BooleanTypeAnnotationNode;
    export function isBooleanLiteralTypeAnnotation(node: Object, opts?: Object): node is BooleanLiteralTypeAnnotationNode;
    export function isNullLiteralTypeAnnotation(node: Object, opts?: Object): node is NullLiteralTypeAnnotationNode;
    export function isClassImplements(node: Object, opts?: Object): node is ClassImplementsNode;
    export function isClassProperty(node: Object, opts?: Object): node is ClassPropertyNode;
    export function isDeclareClass(node: Object, opts?: Object): node is DeclareClassNode;
    export function isDeclareFunction(node: Object, opts?: Object): node is DeclareFunctionNode;
    export function isDeclareInterface(node: Object, opts?: Object): node is DeclareInterfaceNode;
    export function isDeclareModule(node: Object, opts?: Object): node is DeclareModuleNode;
    export function isDeclareTypeAlias(node: Object, opts?: Object): node is DeclareTypeAliasNode;
    export function isDeclareVariable(node: Object, opts?: Object): node is DeclareVariableNode;
    export function isExistentialTypeParam(node: Object, opts?: Object): node is ExistentialTypeParamNode;
    export function isFunctionTypeAnnotation(node: Object, opts?: Object): node is FunctionTypeAnnotationNode;
    export function isFunctionTypeParam(node: Object, opts?: Object): node is FunctionTypeParamNode;
    export function isGenericTypeAnnotation(node: Object, opts?: Object): node is GenericTypeAnnotationNode;
    export function isInterfaceExtends(node: Object, opts?: Object): node is InterfaceExtendsNode;
    export function isInterfaceDeclaration(node: Object, opts?: Object): node is InterfaceDeclarationNode;
    export function isIntersectionTypeAnnotation(node: Object, opts?: Object): node is IntersectionTypeAnnotationNode;
    export function isMixedTypeAnnotation(node: Object, opts?: Object): node is MixedTypeAnnotationNode;
    export function isNullableTypeAnnotation(node: Object, opts?: Object): node is NullableTypeAnnotationNode;
    export function isNumericLiteralTypeAnnotation(node: Object, opts?: Object): node is NumericLiteralTypeAnnotationNode;
    export function isNumberTypeAnnotation(node: Object, opts?: Object): node is NumberTypeAnnotationNode;
    export function isStringLiteralTypeAnnotation(node: Object, opts?: Object): node is StringLiteralTypeAnnotationNode;
    export function isStringTypeAnnotation(node: Object, opts?: Object): node is StringTypeAnnotationNode;
    export function isThisTypeAnnotation(node: Object, opts?: Object): node is ThisTypeAnnotationNode;
    export function isTupleTypeAnnotation(node: Object, opts?: Object): node is TupleTypeAnnotationNode;
    export function isTypeofTypeAnnotation(node: Object, opts?: Object): node is TypeofTypeAnnotationNode;
    export function isTypeAlias(node: Object, opts?: Object): node is TypeAliasNode;
    export function isTypeAnnotation(node: Object, opts?: Object): node is TypeAnnotationNode;
    export function isTypeCastExpression(node: Object, opts?: Object): node is TypeCastExpressionNode;
    export function isTypeParameterDeclaration(node: Object, opts?: Object): node is TypeParameterDeclarationNode;
    export function isTypeParameterInstantiation(node: Object, opts?: Object): node is TypeParameterInstantiationNode;
    export function isObjectTypeAnnotation(node: Object, opts?: Object): node is ObjectTypeAnnotationNode;
    export function isObjectTypeCallProperty(node: Object, opts?: Object): node is ObjectTypeCallPropertyNode;
    export function isObjectTypeIndexer(node: Object, opts?: Object): node is ObjectTypeIndexerNode;
    export function isObjectTypeProperty(node: Object, opts?: Object): node is ObjectTypePropertyNode;
    export function isQualifiedTypeIdentifier(node: Object, opts?: Object): node is QualifiedTypeIdentifierNode;
    export function isUnionTypeAnnotation(node: Object, opts?: Object): node is UnionTypeAnnotationNode;
    export function isVoidTypeAnnotation(node: Object, opts?: Object): node is VoidTypeAnnotationNode;
    export function isJSXAttribute(node: Object, opts?: Object): node is JSXAttributeNode;
    export function isJSXClosingElement(node: Object, opts?: Object): node is JSXClosingElementNode;
    export function isJSXElement(node: Object, opts?: Object): node is JSXElementNode;
    export function isJSXEmptyExpression(node: Object, opts?: Object): node is JSXEmptyExpressionNode;
    export function isJSXExpressionContainer(node: Object, opts?: Object): node is JSXExpressionContainerNode;
    export function isJSXIdentifier(node: Object, opts?: Object): node is JSXIdentifierNode;
    export function isJSXMemberExpression(node: Object, opts?: Object): node is JSXMemberExpressionNode;
    export function isJSXNamespacedName(node: Object, opts?: Object): node is JSXNamespacedNameNode;
    export function isJSXOpeningElement(node: Object, opts?: Object): node is JSXOpeningElementNode;
    export function isJSXSpreadAttribute(node: Object, opts?: Object): node is JSXSpreadAttributeNode;
    export function isJSXText(node: Object, opts?: Object): node is JSXTextNode;
    export function isNoop(node: Object, opts?: Object): node is NoopNode;
    export function isParenthesizedExpression(node: Object, opts?: Object): node is ParenthesizedExpressionNode;
    export function isAwaitExpression(node: Object, opts?: Object): node is AwaitExpressionNode;
    export function isBindExpression(node: Object, opts?: Object): node is BindExpressionNode;
    export function isDecorator(node: Object, opts?: Object): node is DecoratorNode;
    export function isDoExpression(node: Object, opts?: Object): node is DoExpressionNode;
    export function isExportDefaultSpecifier(node: Object, opts?: Object): node is ExportDefaultSpecifierNode;
    export function isExportNamespaceSpecifier(node: Object, opts?: Object): node is ExportNamespaceSpecifierNode;
    export function isRestProperty(node: Object, opts?: Object): node is RestPropertyNode;
    export function isSpreadProperty(node: Object, opts?: Object): node is SpreadPropertyNode;
    export function isExpression(node: Object, opts?: Object): node is ExpressionNode;
    export function isBinary(node: Object, opts?: Object): node is BinaryNode;
    export function isScopable(node: Object, opts?: Object): node is ScopableNode;
    export function isBlockParent(node: Object, opts?: Object): node is BlockParentNode;
    export function isBlock(node: Object, opts?: Object): node is BlockNode;
    export function isStatement(node: Object, opts?: Object): node is StatementNode;
    export function isTerminatorless(node: Object, opts?: Object): node is TerminatorlessNode;
    export function isCompletionStatement(node: Object, opts?: Object): node is CompletionStatementNode;
    export function isConditional(node: Object, opts?: Object): node is ConditionalNode;
    export function isLoop(node: Object, opts?: Object): node is LoopNode;
    export function isWhile(node: Object, opts?: Object): node is WhileNode;
    export function isExpressionWrapper(node: Object, opts?: Object): node is ExpressionWrapperNode;
    export function isFor(node: Object, opts?: Object): node is ForNode;
    export function isForXStatement(node: Object, opts?: Object): node is ForXStatementNode;
    export function isFunction(node: Object, opts?: Object): node is FunctionNode;
    export function isFunctionParent(node: Object, opts?: Object): node is FunctionParentNode;
    export function isPureish(node: Object, opts?: Object): node is PureishNode;
    export function isDeclaration(node: Object, opts?: Object): node is DeclarationNode;
    export function isLVal(node: Object, opts?: Object): node is LValNode;
    export function isLiteral(node: Object, opts?: Object): node is LiteralNode;
    export function isImmutable(node: Object, opts?: Object): node is ImmutableNode;
    export function isUserWhitespacable(node: Object, opts?: Object): node is UserWhitespacableNode;
    export function isMethod(node: Object, opts?: Object): node is MethodNode;
    export function isObjectMember(node: Object, opts?: Object): node is ObjectMemberNode;
    export function isProperty(node: Object, opts?: Object): node is PropertyNode;
    export function isUnaryLike(node: Object, opts?: Object): node is UnaryLikeNode;
    export function isPattern(node: Object, opts?: Object): node is PatternNode;
    export function isClass(node: Object, opts?: Object): node is ClassNode;
    export function isModuleDeclaration(node: Object, opts?: Object): node is ModuleDeclarationNode;
    export function isExportDeclaration(node: Object, opts?: Object): node is ExportDeclarationNode;
    export function isModuleSpecifier(node: Object, opts?: Object): node is ModuleSpecifierNode;
    export function isFlow(node: Object, opts?: Object): node is FlowNode;
    export function isFlowBaseAnnotation(node: Object, opts?: Object): node is FlowBaseAnnotationNode;
    export function isFlowDeclaration(node: Object, opts?: Object): node is FlowDeclarationNode;
    export function isJSX(node: Object, opts?: Object): node is JSXNode;
    export function isNumberLiteral(node: Object, opts?: Object): node is NumericLiteralNode;
    export function isRegexLiteral(node: Object, opts?: Object): node is RegExpLiteralNode;

    export function isReferencedIdentifier(node: Object, opts?: Object): boolean;
    export function isReferencedMemberExpression(node: Object, opts?: Object): boolean;
    export function isBindingIdentifier(node: Object, opts?: Object): boolean;
    export function isScope(node: Object, opts?: Object): boolean;
    export function isReferenced(node: Object, opts?: Object): boolean;
    export function isBlockScoped(node: Object, opts?: Object): boolean;
    export function isVar(node: Object, opts?: Object): boolean;
    export function isUser(node: Object, opts?: Object): boolean;
    export function isGenerated(node: Object, opts?: Object): boolean;
    export function isPure(node: Object, opts?: Object): boolean;

    export function assertArrayExpression(node: Object, opts?: Object): void;
    export function assertAssignmentExpression(node: Object, opts?: Object): void;
    export function assertBinaryExpression(node: Object, opts?: Object): void;
    export function assertDirective(node: Object, opts?: Object): void;
    export function assertDirectiveLiteral(node: Object, opts?: Object): void;
    export function assertBlockStatement(node: Object, opts?: Object): void;
    export function assertBreakStatement(node: Object, opts?: Object): void;
    export function assertCallExpression(node: Object, opts?: Object): void;
    export function assertCatchClause(node: Object, opts?: Object): void;
    export function assertConditionalExpression(node: Object, opts?: Object): void;
    export function assertContinueStatement(node: Object, opts?: Object): void;
    export function assertDebuggerStatement(node: Object, opts?: Object): void;
    export function assertDoWhileStatement(node: Object, opts?: Object): void;
    export function assertEmptyStatement(node: Object, opts?: Object): void;
    export function assertExpressionStatement(node: Object, opts?: Object): void;
    export function assertFile(node: Object, opts?: Object): void;
    export function assertForInStatement(node: Object, opts?: Object): void;
    export function assertForStatement(node: Object, opts?: Object): void;
    export function assertFunctionDeclaration(node: Object, opts?: Object): void;
    export function assertFunctionExpression(node: Object, opts?: Object): void;
    export function assertIdentifier(node: Object, opts?: Object): void;
    export function assertIfStatement(node: Object, opts?: Object): void;
    export function assertLabeledStatement(node: Object, opts?: Object): void;
    export function assertStringLiteral(node: Object, opts?: Object): void;
    export function assertNumericLiteral(node: Object, opts?: Object): void;
    export function assertNullLiteral(node: Object, opts?: Object): void;
    export function assertBooleanLiteral(node: Object, opts?: Object): void;
    export function assertRegExpLiteral(node: Object, opts?: Object): void;
    export function assertLogicalExpression(node: Object, opts?: Object): void;
    export function assertMemberExpression(node: Object, opts?: Object): void;
    export function assertNewExpression(node: Object, opts?: Object): void;
    export function assertProgram(node: Object, opts?: Object): void;
    export function assertObjectExpression(node: Object, opts?: Object): void;
    export function assertObjectMethod(node: Object, opts?: Object): void;
    export function assertObjectProperty(node: Object, opts?: Object): void;
    export function assertRestElement(node: Object, opts?: Object): void;
    export function assertReturnStatement(node: Object, opts?: Object): void;
    export function assertSequenceExpression(node: Object, opts?: Object): void;
    export function assertSwitchCase(node: Object, opts?: Object): void;
    export function assertSwitchStatement(node: Object, opts?: Object): void;
    export function assertThisExpression(node: Object, opts?: Object): void;
    export function assertThrowStatement(node: Object, opts?: Object): void;
    export function assertTryStatement(node: Object, opts?: Object): void;
    export function assertUnaryExpression(node: Object, opts?: Object): void;
    export function assertUpdateExpression(node: Object, opts?: Object): void;
    export function assertVariableDeclaration(node: Object, opts?: Object): void;
    export function assertVariableDeclarator(node: Object, opts?: Object): void;
    export function assertWhileStatement(node: Object, opts?: Object): void;
    export function assertWithStatement(node: Object, opts?: Object): void;
    export function assertAssignmentPattern(node: Object, opts?: Object): void;
    export function assertArrayPattern(node: Object, opts?: Object): void;
    export function assertArrowFunctionExpression(node: Object, opts?: Object): void;
    export function assertClassBody(node: Object, opts?: Object): void;
    export function assertClassDeclaration(node: Object, opts?: Object): void;
    export function assertClassExpression(node: Object, opts?: Object): void;
    export function assertExportAllDeclaration(node: Object, opts?: Object): void;
    export function assertExportDefaultDeclaration(node: Object, opts?: Object): void;
    export function assertExportNamedDeclaration(node: Object, opts?: Object): void;
    export function assertExportSpecifier(node: Object, opts?: Object): void;
    export function assertForOfStatement(node: Object, opts?: Object): void;
    export function assertImportDeclaration(node: Object, opts?: Object): void;
    export function assertImportDefaultSpecifier(node: Object, opts?: Object): void;
    export function assertImportNamespaceSpecifier(node: Object, opts?: Object): void;
    export function assertImportSpecifier(node: Object, opts?: Object): void;
    export function assertMetaProperty(node: Object, opts?: Object): void;
    export function assertClassMethod(node: Object, opts?: Object): void;
    export function assertObjectPattern(node: Object, opts?: Object): void;
    export function assertSpreadElement(node: Object, opts?: Object): void;
    export function assertSuper(node: Object, opts?: Object): void;
    export function assertTaggedTemplateExpression(node: Object, opts?: Object): void;
    export function assertTemplateElement(node: Object, opts?: Object): void;
    export function assertTemplateLiteral(node: Object, opts?: Object): void;
    export function assertYieldExpression(node: Object, opts?: Object): void;
    export function assertAnyTypeAnnotation(node: Object, opts?: Object): void;
    export function assertArrayTypeAnnotation(node: Object, opts?: Object): void;
    export function assertBooleanTypeAnnotation(node: Object, opts?: Object): void;
    export function assertBooleanLiteralTypeAnnotation(node: Object, opts?: Object): void;
    export function assertNullLiteralTypeAnnotation(node: Object, opts?: Object): void;
    export function assertClassImplements(node: Object, opts?: Object): void;
    export function assertClassProperty(node: Object, opts?: Object): void;
    export function assertDeclareClass(node: Object, opts?: Object): void;
    export function assertDeclareFunction(node: Object, opts?: Object): void;
    export function assertDeclareInterface(node: Object, opts?: Object): void;
    export function assertDeclareModule(node: Object, opts?: Object): void;
    export function assertDeclareTypeAlias(node: Object, opts?: Object): void;
    export function assertDeclareVariable(node: Object, opts?: Object): void;
    export function assertExistentialTypeParam(node: Object, opts?: Object): void;
    export function assertFunctionTypeAnnotation(node: Object, opts?: Object): void;
    export function assertFunctionTypeParam(node: Object, opts?: Object): void;
    export function assertGenericTypeAnnotation(node: Object, opts?: Object): void;
    export function assertInterfaceExtends(node: Object, opts?: Object): void;
    export function assertInterfaceDeclaration(node: Object, opts?: Object): void;
    export function assertIntersectionTypeAnnotation(node: Object, opts?: Object): void;
    export function assertMixedTypeAnnotation(node: Object, opts?: Object): void;
    export function assertNullableTypeAnnotation(node: Object, opts?: Object): void;
    export function assertNumericLiteralTypeAnnotation(node: Object, opts?: Object): void;
    export function assertNumberTypeAnnotation(node: Object, opts?: Object): void;
    export function assertStringLiteralTypeAnnotation(node: Object, opts?: Object): void;
    export function assertStringTypeAnnotation(node: Object, opts?: Object): void;
    export function assertThisTypeAnnotation(node: Object, opts?: Object): void;
    export function assertTupleTypeAnnotation(node: Object, opts?: Object): void;
    export function assertTypeofTypeAnnotation(node: Object, opts?: Object): void;
    export function assertTypeAlias(node: Object, opts?: Object): void;
    export function assertTypeAnnotation(node: Object, opts?: Object): void;
    export function assertTypeCastExpression(node: Object, opts?: Object): void;
    export function assertTypeParameterDeclaration(node: Object, opts?: Object): void;
    export function assertTypeParameterInstantiation(node: Object, opts?: Object): void;
    export function assertObjectTypeAnnotation(node: Object, opts?: Object): void;
    export function assertObjectTypeCallProperty(node: Object, opts?: Object): void;
    export function assertObjectTypeIndexer(node: Object, opts?: Object): void;
    export function assertObjectTypeProperty(node: Object, opts?: Object): void;
    export function assertQualifiedTypeIdentifier(node: Object, opts?: Object): void;
    export function assertUnionTypeAnnotation(node: Object, opts?: Object): void;
    export function assertVoidTypeAnnotation(node: Object, opts?: Object): void;
    export function assertJSXAttribute(node: Object, opts?: Object): void;
    export function assertJSXClosingElement(node: Object, opts?: Object): void;
    export function assertJSXElement(node: Object, opts?: Object): void;
    export function assertJSXEmptyExpression(node: Object, opts?: Object): void;
    export function assertJSXExpressionContainer(node: Object, opts?: Object): void;
    export function assertJSXIdentifier(node: Object, opts?: Object): void;
    export function assertJSXMemberExpression(node: Object, opts?: Object): void;
    export function assertJSXNamespacedName(node: Object, opts?: Object): void;
    export function assertJSXOpeningElement(node: Object, opts?: Object): void;
    export function assertJSXSpreadAttribute(node: Object, opts?: Object): void;
    export function assertJSXText(node: Object, opts?: Object): void;
    export function assertNoop(node: Object, opts?: Object): void;
    export function assertParenthesizedExpression(node: Object, opts?: Object): void;
    export function assertAwaitExpression(node: Object, opts?: Object): void;
    export function assertBindExpression(node: Object, opts?: Object): void;
    export function assertDecorator(node: Object, opts?: Object): void;
    export function assertDoExpression(node: Object, opts?: Object): void;
    export function assertExportDefaultSpecifier(node: Object, opts?: Object): void;
    export function assertExportNamespaceSpecifier(node: Object, opts?: Object): void;
    export function assertRestProperty(node: Object, opts?: Object): void;
    export function assertSpreadProperty(node: Object, opts?: Object): void;
    export function assertExpression(node: Object, opts?: Object): void;
    export function assertBinary(node: Object, opts?: Object): void;
    export function assertScopable(node: Object, opts?: Object): void;
    export function assertBlockParent(node: Object, opts?: Object): void;
    export function assertBlock(node: Object, opts?: Object): void;
    export function assertStatement(node: Object, opts?: Object): void;
    export function assertTerminatorless(node: Object, opts?: Object): void;
    export function assertCompletionStatement(node: Object, opts?: Object): void;
    export function assertConditional(node: Object, opts?: Object): void;
    export function assertLoop(node: Object, opts?: Object): void;
    export function assertWhile(node: Object, opts?: Object): void;
    export function assertExpressionWrapper(node: Object, opts?: Object): void;
    export function assertFor(node: Object, opts?: Object): void;
    export function assertForXStatement(node: Object, opts?: Object): void;
    export function assertFunction(node: Object, opts?: Object): void;
    export function assertFunctionParent(node: Object, opts?: Object): void;
    export function assertPureish(node: Object, opts?: Object): void;
    export function assertDeclaration(node: Object, opts?: Object): void;
    export function assertLVal(node: Object, opts?: Object): void;
    export function assertLiteral(node: Object, opts?: Object): void;
    export function assertImmutable(node: Object, opts?: Object): void;
    export function assertUserWhitespacable(node: Object, opts?: Object): void;
    export function assertMethod(node: Object, opts?: Object): void;
    export function assertObjectMember(node: Object, opts?: Object): void;
    export function assertProperty(node: Object, opts?: Object): void;
    export function assertUnaryLike(node: Object, opts?: Object): void;
    export function assertPattern(node: Object, opts?: Object): void;
    export function assertClass(node: Object, opts?: Object): void;
    export function assertModuleDeclaration(node: Object, opts?: Object): void;
    export function assertExportDeclaration(node: Object, opts?: Object): void;
    export function assertModuleSpecifier(node: Object, opts?: Object): void;
    export function assertFlow(node: Object, opts?: Object): void;
    export function assertFlowBaseAnnotation(node: Object, opts?: Object): void;
    export function assertFlowDeclaration(node: Object, opts?: Object): void;
    export function assertJSX(node: Object, opts?: Object): void;
    export function assertNumberLiteral(node: Object, opts?: Object): void;
    export function assertRegexLiteral(node: Object, opts?: Object): void;
}
