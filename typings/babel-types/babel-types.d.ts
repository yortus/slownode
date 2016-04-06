// How this file was created:
// 01. start with contents of https://github.com/babel/babel/blob/master/lib/types.js
// 02. replace double-spaces with quad-spaces
// 03. replace 'declare class' with 'interface'
// 04. replace 'declare function' with 'export function'
// 05. fix nullable syntax:
//      - regex find: \?([a-z<>\[\] |]+)
//      - ...replace: $1 | null | undefined
// 06. change `BabelNodeXXX` interface naming:
//      - regex find: BabelNode([a-z]+)
//      - ...replace: $1
//      - replace BabelNode with Node
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
//      - more accurate typings: https://github.com/babel/babel/blob/master/doc/ast/spec.md
//      - change type annotation: Identifier { name: string }


declare module "babel-types" {

    export interface Comment {
        value: string;
        start: number;
        end: number;
        loc: SourceLocation | null;
    }

    export interface BlockComment extends Comment {
        type: "BlockComment";
    }

    export interface LineComment extends Comment {
        type: "LineComment";
    }

    export interface SourceLocation {
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
        leadingComments?: Array<Comment>;
        innerComments?: Array<Comment>;
        trailingComments?: Array<Comment>;
        start: number | null;
        end: number | null;
        loc: SourceLocation | null;
    }

    export interface ArrayExpression extends Node {
        type: "ArrayExpression";
        elements?: any;
    }

    export interface AssignmentExpression extends Node {
        type: "AssignmentExpression";
        operator: string;
        left: LVal;
        right: Expression;
    }

    export interface BinaryExpression extends Node {
        type: "BinaryExpression";
        operator: "+" | "-" | "/" | "%" | "*" | "**" | "&" | "|" | ">>" | ">>>" | "<<" | "^" | "==" | "===" | "!=" | "!==" | "in" | "instanceof" | ">" | "<" | ">=" | "<=";
        left: Expression;
        right: Expression;
    }

    export interface Directive extends Node {
        type: "Directive";
        value: DirectiveLiteral;
    }

    export interface DirectiveLiteral extends Node {
        type: "DirectiveLiteral";
        value: string;
    }

    export interface BlockStatement extends Node {
        type: "BlockStatement";
        directives?: any;
        body: any;
    }

    export interface BreakStatement extends Node {
        type: "BreakStatement";
        label?: Identifier | null | undefined;
    }

    export interface CallExpression extends Node {
        type: "CallExpression";
        callee: Expression;
        arguments: any;
    }

    export interface CatchClause extends Node {
        type: "CatchClause";
        param: Identifier;
        body: BlockStatement;
    }

    export interface ConditionalExpression extends Node {
        type: "ConditionalExpression";
        test: Expression;
        consequent: Expression;
        alternate: Expression;
    }

    export interface ContinueStatement extends Node {
        type: "ContinueStatement";
        label?: Identifier | null | undefined;
    }

    export interface DebuggerStatement extends Node {
        type: "DebuggerStatement";
    }

    export interface DoWhileStatement extends Node {
        type: "DoWhileStatement";
        test: Expression;
        body: Statement;
    }

    export interface EmptyStatement extends Node {
        type: "EmptyStatement";
    }

    export interface ExpressionStatement extends Node {
        type: "ExpressionStatement";
        expression: Expression;
    }

    export interface File extends Node {
        type: "File";
        program: Program;
        comments: any;
        tokens: any;
    }

    export interface ForInStatement extends Node {
        type: "ForInStatement";
        left: VariableDeclaration | LVal;
        right: Expression;
        body: Statement;
    }

    export interface ForStatement extends Node {
        type: "ForStatement";
        init?: VariableDeclaration | Expression | null | undefined;
        test?: Expression | null | undefined;
        update?: Expression | null | undefined;
        body: Statement;
    }

    export interface FunctionDeclaration extends Node {
        type: "FunctionDeclaration";
        id: Identifier;
        params: any;
        body: BlockStatement;
        generator?: boolean;
        async?: boolean;
        returnType: any;
        typeParameters: any;
    }

    export interface FunctionExpression extends Node {
        type: "FunctionExpression";
        id?: Identifier | null | undefined;
        params: any;
        body: BlockStatement;
        generator?: boolean;
        async?: boolean;
        returnType: any;
        typeParameters: any;
    }

    export interface Identifier extends Expression, Pattern {
        type: "Identifier";
        name: string;
        typeAnnotation: any;
    }

    export interface IfStatement extends Node {
        type: "IfStatement";
        test: Expression;
        consequent: Statement;
        alternate?: Statement | null | undefined;
    }

    export interface LabeledStatement extends Node {
        type: "LabeledStatement";
        label: Identifier;
        body: Statement;
    }

    export interface StringLiteral extends Node {
        type: "StringLiteral";
        value: string;
    }

    export interface NumericLiteral extends Node {
        type: "NumericLiteral";
        value: number;
    }

    export interface NullLiteral extends Node {
        type: "NullLiteral";
    }

    export interface BooleanLiteral extends Node {
        type: "BooleanLiteral";
        value: boolean;
    }

    export interface RegExpLiteral extends Node {
        type: "RegExpLiteral";
        pattern: string;
        flags?: string;
    }

    export interface LogicalExpression extends Node {
        type: "LogicalExpression";
        operator: "||" | "&&";
        left: Expression;
        right: Expression;
    }

    export interface MemberExpression extends Node {
        type: "MemberExpression";
        object: Expression;
        property: any;
        computed?: boolean;
    }

    export interface NewExpression extends Node {
        type: "NewExpression";
        callee: Expression;
        arguments: any;
    }

    export interface Program extends Node {
        type: "Program";
        directives?: any;
        body: any;
    }

    export interface ObjectExpression extends Node {
        type: "ObjectExpression";
        properties: any;
    }

    export interface ObjectMethod extends Node {
        type: "ObjectMethod";
        kind?: any;
        computed?: boolean;
        key: any;
        decorators: any;
        body: BlockStatement;
        generator?: boolean;
        async?: boolean;
        params: any;
        returnType: any;
        typeParameters: any;
    }

    export interface ObjectProperty extends Node {
        type: "ObjectProperty";
        computed?: boolean;
        key: any;
        value: Expression;
        shorthand?: boolean;
        decorators?: any;
    }

    export interface RestElement extends Node {
        type: "RestElement";
        argument: LVal;
        typeAnnotation: any;
    }

    export interface ReturnStatement extends Node {
        type: "ReturnStatement";
        argument?: Expression | null | undefined;
    }

    export interface SequenceExpression extends Node {
        type: "SequenceExpression";
        expressions: any;
    }

    export interface SwitchCase extends Node {
        type: "SwitchCase";
        test?: Expression | null | undefined;
        consequent: any;
    }

    export interface SwitchStatement extends Node {
        type: "SwitchStatement";
        discriminant: Expression;
        cases: any;
    }

    export interface ThisExpression extends Node {
        type: "ThisExpression";
    }

    export interface ThrowStatement extends Node {
        type: "ThrowStatement";
        argument: Expression;
    }

    export interface TryStatement extends Node {
        type: "TryStatement";
        body: BlockStatement;
        handler?: any;
        finalizer?: BlockStatement | null | undefined;
        block: any;
    }

    export interface UnaryExpression extends Node {
        type: "UnaryExpression";
        prefix?: boolean;
        argument: Expression;
        operator: "void" | "delete" | "!" | "+" | "-" | "++" | "--" | "~" | "typeof";
    }

    export interface UpdateExpression extends Node {
        type: "UpdateExpression";
        prefix?: boolean;
        argument: Expression;
        operator: "++" | "--";
    }

    export interface VariableDeclaration extends Node {
        type: "VariableDeclaration";
        kind: any;
        declarations: any;
    }

    export interface VariableDeclarator extends Node {
        type: "VariableDeclarator";
        id: LVal;
        init?: Expression | null | undefined;
    }

    export interface WhileStatement extends Node {
        type: "WhileStatement";
        test: Expression;
        body: BlockStatement | Statement;
    }

    export interface WithStatement extends Node {
        type: "WithStatement";
        object: any;
        body: BlockStatement | Statement;
    }

    export interface AssignmentPattern extends Node {
        type: "AssignmentPattern";
        left: Identifier;
        right: Expression;
    }

    export interface ArrayPattern extends Node {
        type: "ArrayPattern";
        elements: any;
        typeAnnotation: any;
    }

    export interface ArrowFunctionExpression extends Node {
        type: "ArrowFunctionExpression";
        params: any;
        body: BlockStatement | Expression;
        async?: boolean;
        returnType: any;
    }

    export interface ClassBody extends Node {
        type: "ClassBody";
        body: any;
    }

    export interface ClassDeclaration extends Node {
        type: "ClassDeclaration";
        id: Identifier;
        body: ClassBody;
        superClass?: Expression | null | undefined;
        decorators: any;
        mixins: any;
        typeParameters: any;
        superTypeParameters: any;
    }

    export interface ClassExpression extends Node {
        type: "ClassExpression";
        id?: Identifier | null | undefined;
        body: ClassBody;
        superClass?: Expression | null | undefined;
        decorators: any;
        mixins: any;
        typeParameters: any;
        superTypeParameters: any;
    }

    export interface ExportAllDeclaration extends Node {
        type: "ExportAllDeclaration";
        source: StringLiteral;
    }

    export interface ExportDefaultDeclaration extends Node {
        type: "ExportDefaultDeclaration";
        declaration: FunctionDeclaration | ClassDeclaration | Expression;
    }

    export interface ExportNamedDeclaration extends Node {
        type: "ExportNamedDeclaration";
        declaration?: Declaration | null | undefined;
        specifiers: any;
        source?: StringLiteral | null | undefined;
    }

    export interface ExportSpecifier extends Node {
        type: "ExportSpecifier";
        local: Identifier;
        imported: Identifier;
        exported: any;
    }

    export interface ForOfStatement extends Node {
        type: "ForOfStatement";
        left: VariableDeclaration | LVal;
        right: Expression;
        body: Statement;
    }

    export interface ImportDeclaration extends Node {
        type: "ImportDeclaration";
        specifiers: any;
        source: StringLiteral;
    }

    export interface ImportDefaultSpecifier extends Node {
        type: "ImportDefaultSpecifier";
        local: Identifier;
    }

    export interface ImportNamespaceSpecifier extends Node {
        type: "ImportNamespaceSpecifier";
        local: Identifier;
    }

    export interface ImportSpecifier extends Node {
        type: "ImportSpecifier";
        local: Identifier;
        imported: Identifier;
    }

    export interface MetaProperty extends Node {
        type: "MetaProperty";
        meta: string;
        property: string;
    }

    export interface ClassMethod extends Node {
        type: "ClassMethod";
        kind?: any;
        computed?: boolean;
        key: any;
        params: any;
        body: BlockStatement;
        generator?: boolean;
        async?: boolean;
        decorators: any;
        returnType: any;
        typeParameters: any;
    }

    export interface ObjectPattern extends Node {
        type: "ObjectPattern";
        properties: any;
        typeAnnotation: any;
    }

    export interface SpreadElement extends Node {
        type: "SpreadElement";
        argument: Expression;
    }

    export interface Super extends Node {
        type: "Super";
    }

    export interface TaggedTemplateExpression extends Node {
        type: "TaggedTemplateExpression";
        tag: Expression;
        quasi: TemplateLiteral;
    }

    export interface TemplateElement extends Node {
        type: "TemplateElement";
        value: any;
        tail?: boolean;
    }

    export interface TemplateLiteral extends Node {
        type: "TemplateLiteral";
        quasis: any;
        expressions: any;
    }

    export interface YieldExpression extends Node {
        type: "YieldExpression";
        delegate?: boolean;
        argument?: Expression | null | undefined;
    }

    export interface AnyTypeAnnotation extends Node {
        type: "AnyTypeAnnotation";
    }

    export interface ArrayTypeAnnotation extends Node {
        type: "ArrayTypeAnnotation";
        elementType: any;
    }

    export interface BooleanTypeAnnotation extends Node {
        type: "BooleanTypeAnnotation";
    }

    export interface BooleanLiteralTypeAnnotation extends Node {
        type: "BooleanLiteralTypeAnnotation";
    }

    export interface NullLiteralTypeAnnotation extends Node {
        type: "NullLiteralTypeAnnotation";
    }

    export interface ClassImplements extends Node {
        type: "ClassImplements";
        id: any;
        typeParameters: any;
    }

    export interface ClassProperty extends Node {
        type: "ClassProperty";
        key: any;
        value: any;
        typeAnnotation: any;
        decorators: any;
    }

    export interface DeclareClass extends Node {
        type: "DeclareClass";
        id: any;
        typeParameters: any;
        body: any;
    }

    export interface DeclareFunction extends Node {
        type: "DeclareFunction";
        id: any;
    }

    export interface DeclareInterface extends Node {
        type: "DeclareInterface";
        id: any;
        typeParameters: any;
        body: any;
    }

    export interface DeclareModule extends Node {
        type: "DeclareModule";
        id: any;
        body: any;
    }

    export interface DeclareTypeAlias extends Node {
        type: "DeclareTypeAlias";
        id: any;
        typeParameters: any;
        right: any;
    }

    export interface DeclareVariable extends Node {
        type: "DeclareVariable";
        id: any;
    }

    export interface ExistentialTypeParam extends Node {
        type: "ExistentialTypeParam";
    }

    export interface FunctionTypeAnnotation extends Node {
        type: "FunctionTypeAnnotation";
        typeParameters: any;
        params: any;
        rest: any;
        returnType: any;
    }

    export interface FunctionTypeParam extends Node {
        type: "FunctionTypeParam";
        name: any;
        typeAnnotation: any;
    }

    export interface GenericTypeAnnotation extends Node {
        type: "GenericTypeAnnotation";
        id: any;
        typeParameters: any;
    }

    export interface InterfaceExtends extends Node {
        type: "InterfaceExtends";
        id: any;
        typeParameters: any;
    }

    export interface InterfaceDeclaration extends Node {
        type: "InterfaceDeclaration";
        id: any;
        typeParameters: any;
        body: any;
    }

    export interface IntersectionTypeAnnotation extends Node {
        type: "IntersectionTypeAnnotation";
        types: any;
    }

    export interface MixedTypeAnnotation extends Node {
        type: "MixedTypeAnnotation";
    }

    export interface NullableTypeAnnotation extends Node {
        type: "NullableTypeAnnotation";
        typeAnnotation: any;
    }

    export interface NumericLiteralTypeAnnotation extends Node {
        type: "NumericLiteralTypeAnnotation";
    }

    export interface NumberTypeAnnotation extends Node {
        type: "NumberTypeAnnotation";
    }

    export interface StringLiteralTypeAnnotation extends Node {
        type: "StringLiteralTypeAnnotation";
    }

    export interface StringTypeAnnotation extends Node {
        type: "StringTypeAnnotation";
    }

    export interface ThisTypeAnnotation extends Node {
        type: "ThisTypeAnnotation";
    }

    export interface TupleTypeAnnotation extends Node {
        type: "TupleTypeAnnotation";
        types: any;
    }

    export interface TypeofTypeAnnotation extends Node {
        type: "TypeofTypeAnnotation";
        argument: any;
    }

    export interface TypeAlias extends Node {
        type: "TypeAlias";
        id: any;
        typeParameters: any;
        right: any;
    }

    export interface TypeAnnotation extends Node {
        type: "TypeAnnotation";
        typeAnnotation: any;
    }

    export interface TypeCastExpression extends Node {
        type: "TypeCastExpression";
        expression: any;
        typeAnnotation: any;
    }

    export interface TypeParameterDeclaration extends Node {
        type: "TypeParameterDeclaration";
        params: any;
    }

    export interface TypeParameterInstantiation extends Node {
        type: "TypeParameterInstantiation";
        params: any;
    }

    export interface ObjectTypeAnnotation extends Node {
        type: "ObjectTypeAnnotation";
        properties: any;
        indexers: any;
        callProperties: any;
    }

    export interface ObjectTypeCallProperty extends Node {
        type: "ObjectTypeCallProperty";
        value: any;
    }

    export interface ObjectTypeIndexer extends Node {
        type: "ObjectTypeIndexer";
        id: any;
        key: any;
        value: any;
    }

    export interface ObjectTypeProperty extends Node {
        type: "ObjectTypeProperty";
        key: any;
        value: any;
    }

    export interface QualifiedTypeIdentifier extends Node {
        type: "QualifiedTypeIdentifier";
        id: any;
        qualification: any;
    }

    export interface UnionTypeAnnotation extends Node {
        type: "UnionTypeAnnotation";
        types: any;
    }

    export interface VoidTypeAnnotation extends Node {
        type: "VoidTypeAnnotation";
    }

    export interface JSXAttribute extends Node {
        type: "JSXAttribute";
        name: JSXIdentifier | JSXNamespacedName;
        value?: JSXElement | StringLiteral | JSXExpressionContainer | null | undefined;
    }

    export interface JSXClosingElement extends Node {
        type: "JSXClosingElement";
        name: JSXIdentifier | JSXMemberExpression;
    }

    export interface JSXElement extends Node {
        type: "JSXElement";
        openingElement: JSXOpeningElement;
        closingElement?: JSXClosingElement | null | undefined;
        children: any;
        selfClosing: any;
    }

    export interface JSXEmptyExpression extends Node {
        type: "JSXEmptyExpression";
    }

    export interface JSXExpressionContainer extends Node {
        type: "JSXExpressionContainer";
        expression: Expression;
    }

    export interface JSXIdentifier extends Node {
        type: "JSXIdentifier";
        name: string;
    }

    export interface JSXMemberExpression extends Node {
        type: "JSXMemberExpression";
        object: JSXMemberExpression | JSXIdentifier;
        property: JSXIdentifier;
    }

    export interface JSXNamespacedName extends Node {
        type: "JSXNamespacedName";
        namespace: JSXIdentifier;
        name: JSXIdentifier;
    }

    export interface JSXOpeningElement extends Node {
        type: "JSXOpeningElement";
        name: JSXIdentifier | JSXMemberExpression;
        selfClosing?: boolean;
        attributes: any;
    }

    export interface JSXSpreadAttribute extends Node {
        type: "JSXSpreadAttribute";
        argument: Expression;
    }

    export interface JSXText extends Node {
        type: "JSXText";
        value: string;
    }

    export interface Noop extends Node {
        type: "Noop";
    }

    export interface ParenthesizedExpression extends Node {
        type: "ParenthesizedExpression";
        expression: Expression;
    }

    export interface AwaitExpression extends Node {
        type: "AwaitExpression";
        argument: Expression;
    }

    export interface BindExpression extends Node {
        type: "BindExpression";
        object: any;
        callee: any;
    }

    export interface Decorator extends Node {
        type: "Decorator";
        expression: Expression;
    }

    export interface DoExpression extends Node {
        type: "DoExpression";
        body: BlockStatement;
    }

    export interface ExportDefaultSpecifier extends Node {
        type: "ExportDefaultSpecifier";
        exported: Identifier;
    }

    export interface ExportNamespaceSpecifier extends Node {
        type: "ExportNamespaceSpecifier";
        exported: Identifier;
    }

    export interface RestProperty extends Node {
        type: "RestProperty";
        argument: LVal;
    }

    export interface SpreadProperty extends Node {
        type: "SpreadProperty";
        argument: Expression;
    }

    export type Expression = ArrayExpression | AssignmentExpression | BinaryExpression | CallExpression | ConditionalExpression | FunctionExpression | Identifier | StringLiteral | NumericLiteral | NullLiteral | BooleanLiteral | RegExpLiteral | LogicalExpression | MemberExpression | NewExpression | ObjectExpression | SequenceExpression | ThisExpression | UnaryExpression | UpdateExpression | ArrowFunctionExpression | ClassExpression | MetaProperty | Super | TaggedTemplateExpression | TemplateLiteral | YieldExpression | TypeCastExpression | JSXElement | JSXEmptyExpression | JSXIdentifier | JSXMemberExpression | ParenthesizedExpression | AwaitExpression | BindExpression | DoExpression;
    export type Binary = BinaryExpression | LogicalExpression;
    export type Scopable = BlockStatement | CatchClause | DoWhileStatement | ForInStatement | ForStatement | FunctionDeclaration | FunctionExpression | Program | ObjectMethod | SwitchStatement | WhileStatement | ArrowFunctionExpression | ClassDeclaration | ClassExpression | ForOfStatement | ClassMethod;
    export type BlockParent = BlockStatement | DoWhileStatement | ForInStatement | ForStatement | FunctionDeclaration | FunctionExpression | Program | ObjectMethod | SwitchStatement | WhileStatement | ArrowFunctionExpression | ForOfStatement | ClassMethod;
    export type Block = BlockStatement | Program;
    export type Statement = BlockStatement | BreakStatement | ContinueStatement | DebuggerStatement | DoWhileStatement | EmptyStatement | ExpressionStatement | ForInStatement | ForStatement | FunctionDeclaration | IfStatement | LabeledStatement | ReturnStatement | SwitchStatement | ThrowStatement | TryStatement | VariableDeclaration | WhileStatement | WithStatement | ClassDeclaration | ExportAllDeclaration | ExportDefaultDeclaration | ExportNamedDeclaration | ForOfStatement | ImportDeclaration | DeclareClass | DeclareFunction | DeclareInterface | DeclareModule | DeclareTypeAlias | DeclareVariable | InterfaceDeclaration | TypeAlias;
    export type Terminatorless = BreakStatement | ContinueStatement | ReturnStatement | ThrowStatement | YieldExpression | AwaitExpression;
    export type CompletionStatement = BreakStatement | ContinueStatement | ReturnStatement | ThrowStatement;
    export type Conditional = ConditionalExpression | IfStatement;
    export type Loop = DoWhileStatement | ForInStatement | ForStatement | WhileStatement | ForOfStatement;
    export type While = DoWhileStatement | WhileStatement;
    export type ExpressionWrapper = ExpressionStatement | TypeCastExpression | ParenthesizedExpression;
    export type For = ForInStatement | ForStatement | ForOfStatement;
    export type ForXStatement = ForInStatement | ForOfStatement;
    export type Function = FunctionDeclaration | FunctionExpression | ObjectMethod | ArrowFunctionExpression | ClassMethod;
    export type FunctionParent = FunctionDeclaration | FunctionExpression | Program | ObjectMethod | ArrowFunctionExpression | ClassMethod;
    export type Pureish = FunctionDeclaration | FunctionExpression | StringLiteral | NumericLiteral | NullLiteral | BooleanLiteral | ArrowFunctionExpression | ClassDeclaration | ClassExpression;
    export type Declaration = FunctionDeclaration | VariableDeclaration | ClassDeclaration | ExportAllDeclaration | ExportDefaultDeclaration | ExportNamedDeclaration | ImportDeclaration | DeclareClass | DeclareFunction | DeclareInterface | DeclareModule | DeclareTypeAlias | DeclareVariable | InterfaceDeclaration | TypeAlias;
    export type LVal = Identifier | MemberExpression | RestElement | AssignmentPattern | ArrayPattern | ObjectPattern;
    export type Literal = StringLiteral | NumericLiteral | NullLiteral | BooleanLiteral | RegExpLiteral | TemplateLiteral;
    export type Immutable = StringLiteral | NumericLiteral | NullLiteral | BooleanLiteral | JSXAttribute | JSXClosingElement | JSXElement | JSXExpressionContainer | JSXOpeningElement;
    export type UserWhitespacable = ObjectMethod | ObjectProperty | ObjectTypeCallProperty | ObjectTypeIndexer | ObjectTypeProperty;
    export type Method = ObjectMethod | ClassMethod;
    export type ObjectMember = ObjectMethod | ObjectProperty;
    export type Property = ObjectProperty | ClassProperty;
    export type UnaryLike = UnaryExpression | SpreadElement | RestProperty | SpreadProperty;
    export type Pattern = AssignmentPattern | ArrayPattern | ObjectPattern;
    export type Class = ClassDeclaration | ClassExpression;
    export type ModuleDeclaration = ExportAllDeclaration | ExportDefaultDeclaration | ExportNamedDeclaration | ImportDeclaration;
    export type ExportDeclaration = ExportAllDeclaration | ExportDefaultDeclaration | ExportNamedDeclaration;
    export type ModuleSpecifier = ExportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier | ImportSpecifier | ExportDefaultSpecifier | ExportNamespaceSpecifier;
    export type Flow = AnyTypeAnnotation | ArrayTypeAnnotation | BooleanTypeAnnotation | BooleanLiteralTypeAnnotation | NullLiteralTypeAnnotation | ClassImplements | ClassProperty | DeclareClass | DeclareFunction | DeclareInterface | DeclareModule | DeclareTypeAlias | DeclareVariable | ExistentialTypeParam | FunctionTypeAnnotation | FunctionTypeParam | GenericTypeAnnotation | InterfaceExtends | InterfaceDeclaration | IntersectionTypeAnnotation | MixedTypeAnnotation | NullableTypeAnnotation | NumericLiteralTypeAnnotation | NumberTypeAnnotation | StringLiteralTypeAnnotation | StringTypeAnnotation | ThisTypeAnnotation | TupleTypeAnnotation | TypeofTypeAnnotation | TypeAlias | TypeAnnotation | TypeCastExpression | TypeParameterDeclaration | TypeParameterInstantiation | ObjectTypeAnnotation | ObjectTypeCallProperty | ObjectTypeIndexer | ObjectTypeProperty | QualifiedTypeIdentifier | UnionTypeAnnotation | VoidTypeAnnotation;
    export type FlowBaseAnnotation = AnyTypeAnnotation | BooleanTypeAnnotation | NullLiteralTypeAnnotation | MixedTypeAnnotation | NumberTypeAnnotation | StringTypeAnnotation | ThisTypeAnnotation | VoidTypeAnnotation;
    export type FlowDeclaration = DeclareClass | DeclareFunction | DeclareInterface | DeclareModule | DeclareTypeAlias | DeclareVariable | InterfaceDeclaration | TypeAlias;
    export type JSX = JSXAttribute | JSXClosingElement | JSXElement | JSXEmptyExpression | JSXExpressionContainer | JSXIdentifier | JSXMemberExpression | JSXNamespacedName | JSXOpeningElement | JSXSpreadAttribute | JSXText;

    export function arrayExpression(elements?: any): ArrayExpression;
    export function assignmentExpression(operator: string, left: LVal, right: Expression): AssignmentExpression;
    export function binaryExpression(operator: "+" | "-" | "/" | "%" | "*" | "**" | "&" | "|" | ">>" | ">>>" | "<<" | "^" | "==" | "===" | "!=" | "!==" | "in" | "instanceof" | ">" | "<" | ">=" | "<=", left: Expression, right: Expression): BinaryExpression;
    export function directive(value: DirectiveLiteral): Directive;
    export function directiveLiteral(value: string): DirectiveLiteral;
    export function blockStatement(directives: any, body: any): BlockStatement;
    export function breakStatement(label?: Identifier | null | undefined): BreakStatement;
    export function callExpression(callee: Expression, _arguments: any): CallExpression;
    export function catchClause(param: Identifier, body: BlockStatement): CatchClause;
    export function conditionalExpression(test: Expression, consequent: Expression, alternate: Expression): ConditionalExpression;
    export function continueStatement(label?: Identifier | null | undefined): ContinueStatement;
    export function debuggerStatement(): DebuggerStatement;
    export function doWhileStatement(test: Expression, body: Statement): DoWhileStatement;
    export function emptyStatement(): EmptyStatement;
    export function expressionStatement(expression: Expression): ExpressionStatement;
    export function file(program: Program, comments: any, tokens: any): File;
    export function forInStatement(left: VariableDeclaration | LVal, right: Expression, body: Statement): ForInStatement;
    export function forStatement(init: VariableDeclaration | Expression | null | undefined, test: Expression | null | undefined, update: Expression | null | undefined, body: Statement): ForStatement;
    export function functionDeclaration(id: Identifier, params: any, body: BlockStatement, generator: boolean | undefined, async: boolean | undefined, returnType: any, typeParameters: any): FunctionDeclaration;
    export function functionExpression(id: Identifier | null | undefined, params: any, body: BlockStatement, generator: boolean | undefined, async: boolean | undefined, returnType: any, typeParameters: any): FunctionExpression;
    export function identifier(name: any, typeAnnotation: any): Identifier;
    export function ifStatement(test: Expression, consequent: Statement, alternate?: Statement | null | undefined): IfStatement;
    export function labeledStatement(label: Identifier, body: Statement): LabeledStatement;
    export function stringLiteral(value: string): StringLiteral;
    export function numericLiteral(value: number): NumericLiteral;
    export function nullLiteral(): NullLiteral;
    export function booleanLiteral(value: boolean): BooleanLiteral;
    export function regExpLiteral(pattern: string, flags?: string): RegExpLiteral;
    export function logicalExpression(operator: "||" | "&&", left: Expression, right: Expression): LogicalExpression;
    export function memberExpression(object: Expression, property: any, computed?: boolean): MemberExpression;
    export function newExpression(callee: Expression, _arguments: any): NewExpression;
    export function program(directives: any, body: any): Program;
    export function objectExpression(properties: any): ObjectExpression;
    export function objectMethod(kind: any, computed: boolean | undefined, key: any, decorators: any, body: BlockStatement, generator: boolean | undefined, async: boolean | undefined, params: any, returnType: any, typeParameters: any): ObjectMethod;
    export function objectProperty(computed: boolean | undefined, key: any, value: Expression, shorthand?: boolean, decorators?: any): ObjectProperty;
    export function restElement(argument: LVal, typeAnnotation: any): RestElement;
    export function returnStatement(argument?: Expression | null | undefined): ReturnStatement;
    export function sequenceExpression(expressions: any): SequenceExpression;
    export function switchCase(test: Expression | null | undefined, consequent: any): SwitchCase;
    export function switchStatement(discriminant: Expression, cases: any): SwitchStatement;
    export function thisExpression(): ThisExpression;
    export function throwStatement(argument: Expression): ThrowStatement;
    export function tryStatement(body: BlockStatement, handler: any, finalizer: BlockStatement | null | undefined, block: any): TryStatement;
    export function unaryExpression(prefix: boolean | undefined, argument: Expression, operator: "void" | "delete" | "!" | "+" | "-" | "++" | "--" | "~" | "typeof"): UnaryExpression;
    export function updateExpression(prefix: boolean | undefined, argument: Expression, operator: "++" | "--"): UpdateExpression;
    export function variableDeclaration(kind: any, declarations: any): VariableDeclaration;
    export function variableDeclarator(id: LVal, init?: Expression | null | undefined): VariableDeclarator;
    export function whileStatement(test: Expression, body: BlockStatement | Statement): WhileStatement;
    export function withStatement(object: any, body: BlockStatement | Statement): WithStatement;
    export function assignmentPattern(left: Identifier, right: Expression): AssignmentPattern;
    export function arrayPattern(elements: any, typeAnnotation: any): ArrayPattern;
    export function arrowFunctionExpression(params: any, body: BlockStatement | Expression, async: boolean | undefined, returnType: any): ArrowFunctionExpression;
    export function classBody(body: any): ClassBody;
    export function classDeclaration(id: Identifier, body: ClassBody, superClass: Expression | null | undefined, decorators: any, mixins: any, typeParameters: any, superTypeParameters: any, _implements: any): ClassDeclaration;
    export function classExpression(id: Identifier | null | undefined, body: ClassBody, superClass: Expression | null | undefined, decorators: any, mixins: any, typeParameters: any, superTypeParameters: any, _implements: any): ClassExpression;
    export function exportAllDeclaration(source: StringLiteral): ExportAllDeclaration;
    export function exportDefaultDeclaration(declaration: FunctionDeclaration | ClassDeclaration | Expression): ExportDefaultDeclaration;
    export function exportNamedDeclaration(declaration: Declaration | null | undefined, specifiers: any, source?: StringLiteral | null | undefined): ExportNamedDeclaration;
    export function exportSpecifier(local: Identifier, imported: Identifier, exported: any): ExportSpecifier;
    export function forOfStatement(left: VariableDeclaration | LVal, right: Expression, body: Statement): ForOfStatement;
    export function importDeclaration(specifiers: any, source: StringLiteral): ImportDeclaration;
    export function importDefaultSpecifier(local: Identifier): ImportDefaultSpecifier;
    export function importNamespaceSpecifier(local: Identifier): ImportNamespaceSpecifier;
    export function importSpecifier(local: Identifier, imported: Identifier): ImportSpecifier;
    export function metaProperty(meta: string, property: string): MetaProperty;
    export function classMethod(kind: any, computed: boolean | undefined, _static: boolean | undefined, key: any, params: any, body: BlockStatement, generator: boolean | undefined, async: boolean | undefined, decorators: any, returnType: any, typeParameters: any): ClassMethod;
    export function objectPattern(properties: any, typeAnnotation: any): ObjectPattern;
    export function spreadElement(argument: Expression): SpreadElement;
    export function taggedTemplateExpression(tag: Expression, quasi: TemplateLiteral): TaggedTemplateExpression;
    export function templateElement(value: any, tail?: boolean): TemplateElement;
    export function templateLiteral(quasis: any, expressions: any): TemplateLiteral;
    export function yieldExpression(delegate?: boolean, argument?: Expression | null | undefined): YieldExpression;
    export function anyTypeAnnotation(): AnyTypeAnnotation;
    export function arrayTypeAnnotation(elementType: any): ArrayTypeAnnotation;
    export function booleanTypeAnnotation(): BooleanTypeAnnotation;
    export function booleanLiteralTypeAnnotation(): BooleanLiteralTypeAnnotation;
    export function nullLiteralTypeAnnotation(): NullLiteralTypeAnnotation;
    export function classImplements(id: any, typeParameters: any): ClassImplements;
    export function classProperty(key: any, value: any, typeAnnotation: any, decorators: any): ClassProperty;
    export function declareClass(id: any, typeParameters: any, _extends: any, body: any): DeclareClass;
    export function declareFunction(id: any): DeclareFunction;
    export function declareInterface(id: any, typeParameters: any, _extends: any, body: any): DeclareInterface;
    export function declareModule(id: any, body: any): DeclareModule;
    export function declareTypeAlias(id: any, typeParameters: any, right: any): DeclareTypeAlias;
    export function declareVariable(id: any): DeclareVariable;
    export function existentialTypeParam(): ExistentialTypeParam;
    export function functionTypeAnnotation(typeParameters: any, params: any, rest: any, returnType: any): FunctionTypeAnnotation;
    export function functionTypeParam(name: any, typeAnnotation: any): FunctionTypeParam;
    export function genericTypeAnnotation(id: any, typeParameters: any): GenericTypeAnnotation;
    export function interfaceExtends(id: any, typeParameters: any): InterfaceExtends;
    export function interfaceDeclaration(id: any, typeParameters: any, _extends: any, body: any): InterfaceDeclaration;
    export function intersectionTypeAnnotation(types: any): IntersectionTypeAnnotation;
    export function mixedTypeAnnotation(): MixedTypeAnnotation;
    export function nullableTypeAnnotation(typeAnnotation: any): NullableTypeAnnotation;
    export function numericLiteralTypeAnnotation(): NumericLiteralTypeAnnotation;
    export function numberTypeAnnotation(): NumberTypeAnnotation;
    export function stringLiteralTypeAnnotation(): StringLiteralTypeAnnotation;
    export function stringTypeAnnotation(): StringTypeAnnotation;
    export function thisTypeAnnotation(): ThisTypeAnnotation;
    export function tupleTypeAnnotation(types: any): TupleTypeAnnotation;
    export function typeofTypeAnnotation(argument: any): TypeofTypeAnnotation;
    export function typeAlias(id: any, typeParameters: any, right: any): TypeAlias;
    export function typeAnnotation(typeAnnotation: any): TypeAnnotation;
    export function typeCastExpression(expression: any, typeAnnotation: any): TypeCastExpression;
    export function typeParameterDeclaration(params: any): TypeParameterDeclaration;
    export function typeParameterInstantiation(params: any): TypeParameterInstantiation;
    export function objectTypeAnnotation(properties: any, indexers: any, callProperties: any): ObjectTypeAnnotation;
    export function objectTypeCallProperty(value: any): ObjectTypeCallProperty;
    export function objectTypeIndexer(id: any, key: any, value: any): ObjectTypeIndexer;
    export function objectTypeProperty(key: any, value: any): ObjectTypeProperty;
    export function qualifiedTypeIdentifier(id: any, qualification: any): QualifiedTypeIdentifier;
    export function unionTypeAnnotation(types: any): UnionTypeAnnotation;
    export function voidTypeAnnotation(): VoidTypeAnnotation;
    export function jSXAttribute(name: JSXIdentifier | JSXNamespacedName, value?: JSXElement | StringLiteral | JSXExpressionContainer | null | undefined): JSXAttribute;
    export function jSXClosingElement(name: JSXIdentifier | JSXMemberExpression): JSXClosingElement;
    export function jSXElement(openingElement: JSXOpeningElement, closingElement: JSXClosingElement | null | undefined, children: any, selfClosing: any): JSXElement;
    export function jSXEmptyExpression(): JSXEmptyExpression;
    export function jSXExpressionContainer(expression: Expression): JSXExpressionContainer;
    export function jSXIdentifier(name: string): JSXIdentifier;
    export function jSXMemberExpression(object: JSXMemberExpression | JSXIdentifier, property: JSXIdentifier): JSXMemberExpression;
    export function jSXNamespacedName(namespace: JSXIdentifier, name: JSXIdentifier): JSXNamespacedName;
    export function jSXOpeningElement(name: JSXIdentifier | JSXMemberExpression, selfClosing: boolean | undefined, attributes: any): JSXOpeningElement;
    export function jSXSpreadAttribute(argument: Expression): JSXSpreadAttribute;
    export function jSXText(value: string): JSXText;
    export function noop(): Noop;
    export function parenthesizedExpression(expression: Expression): ParenthesizedExpression;
    export function awaitExpression(argument: Expression): AwaitExpression;
    export function bindExpression(object: any, callee: any): BindExpression;
    export function decorator(expression: Expression): Decorator;
    export function doExpression(body: BlockStatement): DoExpression;
    export function exportDefaultSpecifier(exported: Identifier): ExportDefaultSpecifier;
    export function exportNamespaceSpecifier(exported: Identifier): ExportNamespaceSpecifier;
    export function restProperty(argument: LVal): RestProperty;
    export function spreadProperty(argument: Expression): SpreadProperty;

    export function isArrayExpression(node: Object, opts?: Object): node is ArrayExpression;
    export function isAssignmentExpression(node: Object, opts?: Object): node is AssignmentExpression;
    export function isBinaryExpression(node: Object, opts?: Object): node is BinaryExpression;
    export function isDirective(node: Object, opts?: Object): node is Directive;
    export function isDirectiveLiteral(node: Object, opts?: Object): node is DirectiveLiteral;
    export function isBlockStatement(node: Object, opts?: Object): node is BlockStatement;
    export function isBreakStatement(node: Object, opts?: Object): node is BreakStatement;
    export function isCallExpression(node: Object, opts?: Object): node is CallExpression;
    export function isCatchClause(node: Object, opts?: Object): node is CatchClause;
    export function isConditionalExpression(node: Object, opts?: Object): node is ConditionalExpression;
    export function isContinueStatement(node: Object, opts?: Object): node is ContinueStatement;
    export function isDebuggerStatement(node: Object, opts?: Object): node is DebuggerStatement;
    export function isDoWhileStatement(node: Object, opts?: Object): node is DoWhileStatement;
    export function isEmptyStatement(node: Object, opts?: Object): node is EmptyStatement;
    export function isExpressionStatement(node: Object, opts?: Object): node is ExpressionStatement;
    export function isFile(node: Object, opts?: Object): node is File;
    export function isForInStatement(node: Object, opts?: Object): node is ForInStatement;
    export function isForStatement(node: Object, opts?: Object): node is ForStatement;
    export function isFunctionDeclaration(node: Object, opts?: Object): node is FunctionDeclaration;
    export function isFunctionExpression(node: Object, opts?: Object): node is FunctionExpression;
    export function isIdentifier(node: Object, opts?: Object): node is Identifier;
    export function isIfStatement(node: Object, opts?: Object): node is IfStatement;
    export function isLabeledStatement(node: Object, opts?: Object): node is LabeledStatement;
    export function isStringLiteral(node: Object, opts?: Object): node is StringLiteral;
    export function isNumericLiteral(node: Object, opts?: Object): node is NumericLiteral;
    export function isNullLiteral(node: Object, opts?: Object): node is NullLiteral;
    export function isBooleanLiteral(node: Object, opts?: Object): node is BooleanLiteral;
    export function isRegExpLiteral(node: Object, opts?: Object): node is RegExpLiteral;
    export function isLogicalExpression(node: Object, opts?: Object): node is LogicalExpression;
    export function isMemberExpression(node: Object, opts?: Object): node is MemberExpression;
    export function isNewExpression(node: Object, opts?: Object): node is NewExpression;
    export function isProgram(node: Object, opts?: Object): node is Program;
    export function isObjectExpression(node: Object, opts?: Object): node is ObjectExpression;
    export function isObjectMethod(node: Object, opts?: Object): node is ObjectMethod;
    export function isObjectProperty(node: Object, opts?: Object): node is ObjectProperty;
    export function isRestElement(node: Object, opts?: Object): node is RestElement;
    export function isReturnStatement(node: Object, opts?: Object): node is ReturnStatement;
    export function isSequenceExpression(node: Object, opts?: Object): node is SequenceExpression;
    export function isSwitchCase(node: Object, opts?: Object): node is SwitchCase;
    export function isSwitchStatement(node: Object, opts?: Object): node is SwitchStatement;
    export function isThisExpression(node: Object, opts?: Object): node is ThisExpression;
    export function isThrowStatement(node: Object, opts?: Object): node is ThrowStatement;
    export function isTryStatement(node: Object, opts?: Object): node is TryStatement;
    export function isUnaryExpression(node: Object, opts?: Object): node is UnaryExpression;
    export function isUpdateExpression(node: Object, opts?: Object): node is UpdateExpression;
    export function isVariableDeclaration(node: Object, opts?: Object): node is VariableDeclaration;
    export function isVariableDeclarator(node: Object, opts?: Object): node is VariableDeclarator;
    export function isWhileStatement(node: Object, opts?: Object): node is WhileStatement;
    export function isWithStatement(node: Object, opts?: Object): node is WithStatement;
    export function isAssignmentPattern(node: Object, opts?: Object): node is AssignmentPattern;
    export function isArrayPattern(node: Object, opts?: Object): node is ArrayPattern;
    export function isArrowFunctionExpression(node: Object, opts?: Object): node is ArrowFunctionExpression;
    export function isClassBody(node: Object, opts?: Object): node is ClassBody;
    export function isClassDeclaration(node: Object, opts?: Object): node is ClassDeclaration;
    export function isClassExpression(node: Object, opts?: Object): node is ClassExpression;
    export function isExportAllDeclaration(node: Object, opts?: Object): node is ExportAllDeclaration;
    export function isExportDefaultDeclaration(node: Object, opts?: Object): node is ExportDefaultDeclaration;
    export function isExportNamedDeclaration(node: Object, opts?: Object): node is ExportNamedDeclaration;
    export function isExportSpecifier(node: Object, opts?: Object): node is ExportSpecifier;
    export function isForOfStatement(node: Object, opts?: Object): node is ForOfStatement;
    export function isImportDeclaration(node: Object, opts?: Object): node is ImportDeclaration;
    export function isImportDefaultSpecifier(node: Object, opts?: Object): node is ImportDefaultSpecifier;
    export function isImportNamespaceSpecifier(node: Object, opts?: Object): node is ImportNamespaceSpecifier;
    export function isImportSpecifier(node: Object, opts?: Object): node is ImportSpecifier;
    export function isMetaProperty(node: Object, opts?: Object): node is MetaProperty;
    export function isClassMethod(node: Object, opts?: Object): node is ClassMethod;
    export function isObjectPattern(node: Object, opts?: Object): node is ObjectPattern;
    export function isSpreadElement(node: Object, opts?: Object): node is SpreadElement;
    export function isSuper(node: Object, opts?: Object): node is Super;
    export function isTaggedTemplateExpression(node: Object, opts?: Object): node is TaggedTemplateExpression;
    export function isTemplateElement(node: Object, opts?: Object): node is TemplateElement;
    export function isTemplateLiteral(node: Object, opts?: Object): node is TemplateLiteral;
    export function isYieldExpression(node: Object, opts?: Object): node is YieldExpression;
    export function isAnyTypeAnnotation(node: Object, opts?: Object): node is AnyTypeAnnotation;
    export function isArrayTypeAnnotation(node: Object, opts?: Object): node is ArrayTypeAnnotation;
    export function isBooleanTypeAnnotation(node: Object, opts?: Object): node is BooleanTypeAnnotation;
    export function isBooleanLiteralTypeAnnotation(node: Object, opts?: Object): node is BooleanLiteralTypeAnnotation;
    export function isNullLiteralTypeAnnotation(node: Object, opts?: Object): node is NullLiteralTypeAnnotation;
    export function isClassImplements(node: Object, opts?: Object): node is ClassImplements;
    export function isClassProperty(node: Object, opts?: Object): node is ClassProperty;
    export function isDeclareClass(node: Object, opts?: Object): node is DeclareClass;
    export function isDeclareFunction(node: Object, opts?: Object): node is DeclareFunction;
    export function isDeclareInterface(node: Object, opts?: Object): node is DeclareInterface;
    export function isDeclareModule(node: Object, opts?: Object): node is DeclareModule;
    export function isDeclareTypeAlias(node: Object, opts?: Object): node is DeclareTypeAlias;
    export function isDeclareVariable(node: Object, opts?: Object): node is DeclareVariable;
    export function isExistentialTypeParam(node: Object, opts?: Object): node is ExistentialTypeParam;
    export function isFunctionTypeAnnotation(node: Object, opts?: Object): node is FunctionTypeAnnotation;
    export function isFunctionTypeParam(node: Object, opts?: Object): node is FunctionTypeParam;
    export function isGenericTypeAnnotation(node: Object, opts?: Object): node is GenericTypeAnnotation;
    export function isInterfaceExtends(node: Object, opts?: Object): node is InterfaceExtends;
    export function isInterfaceDeclaration(node: Object, opts?: Object): node is InterfaceDeclaration;
    export function isIntersectionTypeAnnotation(node: Object, opts?: Object): node is IntersectionTypeAnnotation;
    export function isMixedTypeAnnotation(node: Object, opts?: Object): node is MixedTypeAnnotation;
    export function isNullableTypeAnnotation(node: Object, opts?: Object): node is NullableTypeAnnotation;
    export function isNumericLiteralTypeAnnotation(node: Object, opts?: Object): node is NumericLiteralTypeAnnotation;
    export function isNumberTypeAnnotation(node: Object, opts?: Object): node is NumberTypeAnnotation;
    export function isStringLiteralTypeAnnotation(node: Object, opts?: Object): node is StringLiteralTypeAnnotation;
    export function isStringTypeAnnotation(node: Object, opts?: Object): node is StringTypeAnnotation;
    export function isThisTypeAnnotation(node: Object, opts?: Object): node is ThisTypeAnnotation;
    export function isTupleTypeAnnotation(node: Object, opts?: Object): node is TupleTypeAnnotation;
    export function isTypeofTypeAnnotation(node: Object, opts?: Object): node is TypeofTypeAnnotation;
    export function isTypeAlias(node: Object, opts?: Object): node is TypeAlias;
    export function isTypeAnnotation(node: Object, opts?: Object): node is TypeAnnotation;
    export function isTypeCastExpression(node: Object, opts?: Object): node is TypeCastExpression;
    export function isTypeParameterDeclaration(node: Object, opts?: Object): node is TypeParameterDeclaration;
    export function isTypeParameterInstantiation(node: Object, opts?: Object): node is TypeParameterInstantiation;
    export function isObjectTypeAnnotation(node: Object, opts?: Object): node is ObjectTypeAnnotation;
    export function isObjectTypeCallProperty(node: Object, opts?: Object): node is ObjectTypeCallProperty;
    export function isObjectTypeIndexer(node: Object, opts?: Object): node is ObjectTypeIndexer;
    export function isObjectTypeProperty(node: Object, opts?: Object): node is ObjectTypeProperty;
    export function isQualifiedTypeIdentifier(node: Object, opts?: Object): node is QualifiedTypeIdentifier;
    export function isUnionTypeAnnotation(node: Object, opts?: Object): node is UnionTypeAnnotation;
    export function isVoidTypeAnnotation(node: Object, opts?: Object): node is VoidTypeAnnotation;
    export function isJSXAttribute(node: Object, opts?: Object): node is JSXAttribute;
    export function isJSXClosingElement(node: Object, opts?: Object): node is JSXClosingElement;
    export function isJSXElement(node: Object, opts?: Object): node is JSXElement;
    export function isJSXEmptyExpression(node: Object, opts?: Object): node is JSXEmptyExpression;
    export function isJSXExpressionContainer(node: Object, opts?: Object): node is JSXExpressionContainer;
    export function isJSXIdentifier(node: Object, opts?: Object): node is JSXIdentifier;
    export function isJSXMemberExpression(node: Object, opts?: Object): node is JSXMemberExpression;
    export function isJSXNamespacedName(node: Object, opts?: Object): node is JSXNamespacedName;
    export function isJSXOpeningElement(node: Object, opts?: Object): node is JSXOpeningElement;
    export function isJSXSpreadAttribute(node: Object, opts?: Object): node is JSXSpreadAttribute;
    export function isJSXText(node: Object, opts?: Object): node is JSXText;
    export function isNoop(node: Object, opts?: Object): node is Noop;
    export function isParenthesizedExpression(node: Object, opts?: Object): node is ParenthesizedExpression;
    export function isAwaitExpression(node: Object, opts?: Object): node is AwaitExpression;
    export function isBindExpression(node: Object, opts?: Object): node is BindExpression;
    export function isDecorator(node: Object, opts?: Object): node is Decorator;
    export function isDoExpression(node: Object, opts?: Object): node is DoExpression;
    export function isExportDefaultSpecifier(node: Object, opts?: Object): node is ExportDefaultSpecifier;
    export function isExportNamespaceSpecifier(node: Object, opts?: Object): node is ExportNamespaceSpecifier;
    export function isRestProperty(node: Object, opts?: Object): node is RestProperty;
    export function isSpreadProperty(node: Object, opts?: Object): node is SpreadProperty;
    export function isExpression(node: Object, opts?: Object): node is Expression;
    export function isBinary(node: Object, opts?: Object): node is Binary;
    export function isScopable(node: Object, opts?: Object): node is Scopable;
    export function isBlockParent(node: Object, opts?: Object): node is BlockParent;
    export function isBlock(node: Object, opts?: Object): node is Block;
    export function isStatement(node: Object, opts?: Object): node is Statement;
    export function isTerminatorless(node: Object, opts?: Object): node is Terminatorless;
    export function isCompletionStatement(node: Object, opts?: Object): node is CompletionStatement;
    export function isConditional(node: Object, opts?: Object): node is Conditional;
    export function isLoop(node: Object, opts?: Object): node is Loop;
    export function isWhile(node: Object, opts?: Object): node is While;
    export function isExpressionWrapper(node: Object, opts?: Object): node is ExpressionWrapper;
    export function isFor(node: Object, opts?: Object): node is For;
    export function isForXStatement(node: Object, opts?: Object): node is ForXStatement;
    export function isFunction(node: Object, opts?: Object): node is Function;
    export function isFunctionParent(node: Object, opts?: Object): node is FunctionParent;
    export function isPureish(node: Object, opts?: Object): node is Pureish;
    export function isDeclaration(node: Object, opts?: Object): node is Declaration;
    export function isLVal(node: Object, opts?: Object): node is LVal;
    export function isLiteral(node: Object, opts?: Object): node is Literal;
    export function isImmutable(node: Object, opts?: Object): node is Immutable;
    export function isUserWhitespacable(node: Object, opts?: Object): node is UserWhitespacable;
    export function isMethod(node: Object, opts?: Object): node is Method;
    export function isObjectMember(node: Object, opts?: Object): node is ObjectMember;
    export function isProperty(node: Object, opts?: Object): node is Property;
    export function isUnaryLike(node: Object, opts?: Object): node is UnaryLike;
    export function isPattern(node: Object, opts?: Object): node is Pattern;
    export function isClass(node: Object, opts?: Object): node is Class;
    export function isModuleDeclaration(node: Object, opts?: Object): node is ModuleDeclaration;
    export function isExportDeclaration(node: Object, opts?: Object): node is ExportDeclaration;
    export function isModuleSpecifier(node: Object, opts?: Object): node is ModuleSpecifier;
    export function isFlow(node: Object, opts?: Object): node is Flow;
    export function isFlowBaseAnnotation(node: Object, opts?: Object): node is FlowBaseAnnotation;
    export function isFlowDeclaration(node: Object, opts?: Object): node is FlowDeclaration;
    export function isJSX(node: Object, opts?: Object): node is JSX;
    export function isNumberLiteral(node: Object, opts?: Object): node is NumericLiteral;
    export function isRegexLiteral(node: Object, opts?: Object): node is RegExpLiteral;

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