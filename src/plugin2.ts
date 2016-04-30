import * as babel from 'babel-core';                // TODO: remove this
import * as babylon from 'babylon';                 // TODO: remove this
import * as t from "babel-types";                   // TODO: remove this / use types only
import {Node, ObjectProperty} from "babel-types";   // TODO: elided (types only)
import {Visitor} from "babel-traverse";             // TODO: elided (types only)
import generate from "babel-generator";             // TODO: remove this
// TODO: not used (yet)... import template = require("babel-template");





export default function ({types: t}: typeof babel) {
    return {
        visitor: <Visitor> {
            FunctionDeclaration(path) {
                let newNode = transformToStateMachine(path.node);
                path.replaceWith(newNode);
            }
        }
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





// TODO: this module needs more inline documentation to make it clearer what each bit does, to support long-term maintenance.
// TODO: source maps?
// TODO: note implicit use of "types".Steppable.StateMachine.State type in generated code in here...


/** Returns an equivalent AST in a form suitable for running inside a steppable object. */
function transformToStateMachine(func: t.Function): t.FunctionExpression {

    // Validate arguments.
    assert(func.params.every(p => p.type === 'Identifier'));
    assert(func.body.type === 'BlockStatement');

    // Construct a Rewriter instance to handle the rewrite operation.
    var rewriter = new Rewriter(<any> func.body, <any> func.params);

    // Extract and return the rewritten AST.
    var newFunc = <t.FunctionExpression> rewriter.generateAST();
    return newFunc;
}


/** Provides methods and state for rewriting an AST into a form suitable for running inside a steppable object. */
class Rewriter {

    // TODO: doc all members...
    constructor(body: t.BlockStatement, params: t.Identifier[]) {

        // Initialise state.
        this.emitCase(this.newLabel());
        this.pushJumpTarget(JumpTarget.Throw, '@fail');
        this.pushJumpTarget(JumpTarget.Return, '@done');

        // Remove all const declarations from the AST. These will be emitted as ambients.
        traverseTree(body, node => {
            matchNode(node, {
                VariableDeclaration: (stmt) => {
                    if (stmt.kind !== 'const') return;
                    this.constDecls = this.constDecls.concat(stmt.declarations);
                    Object.keys(stmt).forEach(key => delete stmt[key]);
                    stmt.type = <any> 'EmptyStatement';
                },
                Otherwise: (node) => { /* pass-through */ }
            });
        });

        // Make a list of all the ambient identifier names.
        // TODO: better names: free variables, non-local variables...
        this.ambientIdentifierNames = [].concat(
            'require',
            Object.getOwnPropertyNames(global),
            this.constDecls.map(decl => decl.id['name'])
        );

        // Emit code to initially assign formal parameters from $.arguments.
        for (var i = 0; i < params.length; ++i) {
            var $paramName = this.getIdentifierReference(params[i].name);
            var $arguments = this.getIdentifierReference('arguments');
            this.emitText(`${$paramName} = ${$arguments}[${i}];`);
        }

        // Emit the body of the function.
        this.emitStmt(body);
    }

    currentThrowTarget: string;

    temporaryIdentifierPool: string[] = [];

    getIdentifierReference(name: string): string {
        var isAmbient = this.ambientIdentifierNames.indexOf(name) !== -1;
        return `${isAmbient ? '$.ambient' : '$.local'}.${name}`;
    }

    reserveTemporaryIdentifier(name: string): string {
        if (this.temporaryIdentifierPool.length > 0) return this.temporaryIdentifierPool.pop();
        var tempId = `$.temp.$${++this.temporaryIdentifierCounter}`;
        this.temporaryIdentifiersInUse.push(tempId);
        return tempId;
    }

    releaseTemporaryIdentifier(name: string): void {
        var i = this.temporaryIdentifiersInUse.indexOf(name);
        this.temporaryIdentifiersInUse.splice(i, 1);
        this.temporaryIdentifierPool.unshift(name);
    }

    isTemporaryIdentifier(name: string) {
        return name.indexOf('$.temp') === 0;
    }

    newLabel(): string {
        return '@' + ++this.nextLabel;
    }

    pushJumpTarget(type: JumpTarget, value: string) {
        this.jumpTargets.push({ type, value });
        if (type === JumpTarget.Throw) this.currentThrowTarget = value;
    }

    popJumpTarget(count = 1) {
        while (--count >= 0) {
            var jumpTarget = this.jumpTargets.pop();
            if (jumpTarget.type === JumpTarget.Throw) {
                var label = findLast(this.jumpTargets, tgt => tgt.type === JumpTarget.Throw).value;
                this.currentThrowTarget = label;
            }
        }
    }

    emitCase(label: string) {
        var newCase = t.switchCase(t.stringLiteral(label), []);
        this.switchCases.push(newCase);
    }

    emitText(text: string) {
        var stmt = <t.Statement> this.generateAST(text);
        this.switchCases[this.switchCases.length - 1].consequent.push(stmt);
    }

    emitStmt(stmt: t.Statement) {
        rewriteStatement(stmt, this);
    }

    emitExpr(expr: t.Expression, $tgt: string) {
        rewriteExpression(expr, $tgt, this);
    }

    emitJump(type: JumpTarget, value?: string) {
        var i = findLastIndex(this.jumpTargets, tgt => tgt.type === type && (!value || tgt.value === value));
        assert(i !== -1); // Should never happen
        var label = this.jumpTargets[i].value;
        var finalizers = this.jumpTargets.slice(i + 1).filter(tgt => tgt.type === JumpTarget.Finalize).map(tgt => tgt.value);
        if (finalizers.length > 0) {
            this.emitText(`$.finalizers.pending = ['${finalizers.join("', '")}'];`);
            this.emitText(`$.finalizers.afterward = '${label}';`);
            this.emitText(`$.pos = '@finalize';`);
            this.emitText('continue;');
        }
        else {
            this.emitText(`$.pos = '${label}';`);
            this.emitText('continue;');
        }
    }

    emitFunc(decl: t.FunctionDeclaration) {
        this.hoistedFunctions.push(decl);
    }

    generateAST(fromFragment?: string): t.FunctionExpression | t.Statement {
        var source = `
            (function steppableBody($) {
                $.pos = $.pos || '@start';
                $.local = $.local || {};
                ${this.hoistedFunctions.map(decl => `$.local.${decl.id.name} = $.local.${decl.id.name} || (${generate(decl).code});`).join('\n')}
                $.temp = $.temp || {};
                $.error = $.error || { handler: '@fail' };
                $.finalizers = $.finalizers || { pending: [] };
                if (!$.ambient) {
                    Object.defineProperty($, 'ambient', {
                        enumerable: false,
                        value: steppableBody.ambient || (steppableBody.ambient = (function () {
                            ${this.constDecls.map(decl => `var ${decl.id['name']} = ${generate(decl.init).code};`).join('\n')}
                            var ambient = Object.create(global);
                            ambient.require = require ? (require.main ? require.main.require : require) : null;
                            ${this.constDecls.map(decl => `ambient.${decl.id['name']} = ${decl.id['name']};`).join('\n')}
                            return ambient;
                        })())
                    });
                }
                while (true) {
                    try {
                        switch ($.pos) {
                            case '@start':
                                ${fromFragment || ''}
                            case '@done':
                                $.outgoing = { type: 'return', value: $.result };
                                return;
                            case '@fail':
                                $.outgoing = { type: 'throw', value: $.error.value };
                                return;
                            case '@finalize':
                                $.pos = $.finalizers.pending.pop() || $.finalizers.afterward;
                                continue;
                        }
                    }
                    catch (ex) {
                        $.error.occurred = true;
                        $.error.value = ex;
                        $.pos = $.error.handler;
                        continue;
                    }
                }
            })
        `;
        var ast = <t.File> babylon.parse(source);
        var funcExpr = <t.FunctionExpression> ast.program.body[0]['expression'];
        var whileStmt = <t.WhileStatement> funcExpr.body['body'][6 + this.hoistedFunctions.length];
        var tryStmt = <t.TryStatement> whileStmt.body['body'][0];
        var switchStmt = <t.SwitchStatement> tryStmt.block['body'][0];
        if (fromFragment) {
            var stmts = switchStmt.cases[0].consequent;
            if (stmts.length === 1) return stmts[0];
            throw new Error('makeStateMachine: fromFragment: expected a single statement');
        }
        else {
            switchStmt.cases.splice(1, 0, ...this.switchCases);
            return funcExpr;
        }
    }

    private constDecls: t.VariableDeclarator[] = [];

    private hoistedFunctions: t.FunctionDeclaration[] = [];

    private ambientIdentifierNames: string[];

    private temporaryIdentifierCounter = 0;

    private temporaryIdentifiersInUse: string[] = [];

    private nextLabel = 0;

    private switchCases: t.SwitchCase[] = [];

    private jumpTargets: { type: JumpTarget; value: string; }[] = [];
}


// TODO: doc...
enum JumpTarget {
    AfterTry,
    Break,
    Continue,
    Finalize,
    Return,
    Throw
}


// TODO: doc...
function rewriteStatement(stmt: t.Statement, emitter: Rewriter): void {
    matchNode(stmt, {

        EmptyStatement: (stmt) => {},

        BlockStatement: (stmt) => {
            stmt.body.forEach(stmt => emitter.emitStmt(stmt));
        },

        ExpressionStatement: (stmt) => {
            var $void = emitter.reserveTemporaryIdentifier('void');
            emitter.emitExpr(stmt.expression, $void);
            emitter.releaseTemporaryIdentifier($void);
        },

        IfStatement: (stmt) => {
            var conLabel = emitter.newLabel();
            var altLabel = emitter.newLabel();
            var exitLabel = emitter.newLabel();
            var $test = emitter.reserveTemporaryIdentifier('test');
            emitter.emitExpr(stmt.test, $test);
            emitter.emitText(`$.pos = ${$test} ? '${conLabel}' : '${altLabel}';`);
            emitter.releaseTemporaryIdentifier($test);
            emitter.emitText(`continue;`);
            emitter.emitCase(conLabel);
            emitter.emitStmt(stmt.consequent);
            emitter.emitText(`$.pos = '${exitLabel}';`);
            emitter.emitText(`continue;`);
            emitter.emitCase(altLabel);
            if (stmt.alternate) emitter.emitStmt(stmt.alternate);
            emitter.emitCase(exitLabel);
        },

        SwitchStatement: (stmt) => {
            var exitLabel = emitter.newLabel();
            emitter.pushJumpTarget(JumpTarget.Break, exitLabel);
            var $discriminant = emitter.reserveTemporaryIdentifier('discriminant');
            var $test = emitter.reserveTemporaryIdentifier('test');
            emitter.emitExpr(stmt.discriminant, $discriminant);
            stmt.cases.forEach(switchCase => {
                var matchLabel = emitter.newLabel();
                var skipLabel = emitter.newLabel();
                if (switchCase.test) {
                    emitter.emitExpr(switchCase.test, $test);
                    emitter.emitText(`$.pos = ${$discriminant} === ${$test} ? '${matchLabel}' : '${skipLabel}'`);
                    emitter.emitText('continue;');
                }
                emitter.emitCase(matchLabel);
                switchCase.consequent.forEach(stmt => emitter.emitStmt(stmt));
                emitter.emitCase(skipLabel);
            });
            emitter.emitCase(exitLabel);
            emitter.releaseTemporaryIdentifier($discriminant);
            emitter.releaseTemporaryIdentifier($test);
            emitter.popJumpTarget();
        },

        WhileStatement: (stmt) => {
            var entryLabel = emitter.newLabel();
            var iterLabel = emitter.newLabel();
            var exitLabel = emitter.newLabel();
            emitter.pushJumpTarget(JumpTarget.Break, exitLabel);
            emitter.pushJumpTarget(JumpTarget.Continue, entryLabel);
            emitter.emitCase(entryLabel);
            var $test = emitter.reserveTemporaryIdentifier('test');
            emitter.emitExpr(stmt.test, $test);
            emitter.emitText(`$.pos = ${$test} ? '${iterLabel}' : '${exitLabel}';`);
            emitter.releaseTemporaryIdentifier($test);
            emitter.emitText(`continue;`);
            emitter.emitCase(iterLabel);
            emitter.emitStmt(stmt.body);
            emitter.emitText(`$.pos = '${entryLabel}';`);
            emitter.emitText(`continue;`);
            emitter.emitCase(exitLabel);
            emitter.popJumpTarget(2);
        },

        DoWhileStatement: (stmt) => {
            var entryLabel = emitter.newLabel();
            var iterLabel = emitter.newLabel();
            var exitLabel = emitter.newLabel();
            emitter.pushJumpTarget(JumpTarget.Break, exitLabel);
            emitter.pushJumpTarget(JumpTarget.Continue, entryLabel);
            emitter.emitCase(entryLabel);
            emitter.emitStmt(stmt.body);
            var $test = emitter.reserveTemporaryIdentifier('test');
            emitter.emitExpr(stmt.test, $test);
            emitter.emitText(`$.pos = ${$test} ? '${entryLabel}' : '${exitLabel}';`);
            emitter.releaseTemporaryIdentifier($test);
            emitter.emitText(`continue;`);
            emitter.emitCase(exitLabel);
            emitter.popJumpTarget(2);
        },

        ForStatement: (stmt) => {
            var entryLabel = emitter.newLabel();
            var iterLabel = emitter.newLabel();
            var exitLabel = emitter.newLabel();
            emitter.pushJumpTarget(JumpTarget.Break, exitLabel);
            emitter.pushJumpTarget(JumpTarget.Continue, entryLabel);
            if (stmt.init) {
                if (t.isVariableDeclaration(stmt.init)) {
                    emitter.emitStmt(stmt.init);
                }
                else {
                    var $void = emitter.reserveTemporaryIdentifier('void');
                    emitter.emitExpr(stmt.init, $void);
                    emitter.releaseTemporaryIdentifier($void);
                }
            }
            emitter.emitCase(entryLabel);
            if (stmt.test) {
                var $test = emitter.reserveTemporaryIdentifier('test');
                emitter.emitExpr(stmt.test, $test);
                emitter.emitText(`$.pos = ${$test} ? '${iterLabel}' : '${exitLabel}';`);
                emitter.releaseTemporaryIdentifier($test);
                emitter.emitText(`continue;`);
            }
            emitter.emitCase(iterLabel);
            emitter.emitStmt(stmt.body);
            if (stmt.update) {
                var $void = emitter.reserveTemporaryIdentifier('void');
                emitter.emitExpr(stmt.update, $void);
                emitter.releaseTemporaryIdentifier($void);
            }
            emitter.emitText(`$.pos = '${entryLabel}';`);
            emitter.emitText(`continue;`);
            emitter.emitCase(exitLabel);
            emitter.popJumpTarget(2);
        },

        ForInStatement: (stmt) => {
            var loopVar = stmt.left.type === 'VariableDeclaration' ? stmt.left['declarations'][0].id : stmt.left;
            if (loopVar.type !== 'Identifier') throw new Error(`Steppable: unsupported for..in loop variable type: '${loopVar.type}'`);
            if (stmt.left.type === 'VariableDeclaration') {
                if (stmt.left['declarations'][0].init) throw new Error(`Steppable: for..in loop variable initialiser is not supported.`);
            }
            var $name: string = loopVar.name;
            var $obj = emitter.reserveTemporaryIdentifier('obj');
            var $props = emitter.reserveTemporaryIdentifier('props');
            var $i = emitter.reserveTemporaryIdentifier('i');
            emitter.emitExpr(stmt.right, $obj);
            var $o = emitter.reserveTemporaryIdentifier('o');
            emitter.emitText(`for (${$o} = ${$obj}, ${$props} = []; ${$o}; ${$props} = ${$props}.concat(Object.keys(${$o})), ${$o} = ${$o}.prototype) ;`);
            emitter.releaseTemporaryIdentifier('$o');
            var forStmt = <t.ForStatement> babylon.parse(`for (${$i} = 0; ${$i} < ${$props}.length; ++${$i}) { ${$name} = ${$props}[${$i}]; }`)['program'].body[0];
            var forBody = (<t.BlockStatement> forStmt.body);
            forBody.body = forBody.body.concat(stmt.body.type === 'BlockStatement' ? stmt.body['body'] : stmt.body);
            emitter.emitStmt(forStmt);
            emitter.releaseTemporaryIdentifier('$obj');
            emitter.releaseTemporaryIdentifier('$props');
            emitter.releaseTemporaryIdentifier('$i');
        },

        TryStatement: (stmt) => {
            var catchLabel = emitter.newLabel();
            var conLabel = emitter.newLabel();
            var altLabel = emitter.newLabel();
            var finallyLabel = emitter.newLabel();
            var exitLabel = emitter.newLabel();

            // block entry
            emitter.pushJumpTarget(JumpTarget.AfterTry, exitLabel);
            emitter.pushJumpTarget(JumpTarget.Finalize, finallyLabel);

            // try & catch sub-blocks
            emitter.pushJumpTarget(JumpTarget.Throw, catchLabel);
            emitter.emitText(`$.error.handler = '${emitter.currentThrowTarget}';`);
            emitter.emitText(`$.error.occurred = false;`);
            emitter.emitStmt(stmt.block);
            emitter.emitCase(catchLabel);
            emitter.popJumpTarget(); // Throw
            emitter.emitText(`$.error.handler = '${emitter.currentThrowTarget}';`);
            emitter.emitText(`$.pos = $.error.occurred ? '${conLabel}' : '${altLabel}';`);
            emitter.emitText('continue;');
            emitter.emitCase(conLabel);
            if (stmt.handler) {
                if (stmt.handler.param.type !== 'Identifier') throw new Error(`Steppable: catch parameter must be an identifier`);
                var $ex = emitter.getIdentifierReference(stmt.handler.param['name']);
                emitter.emitText(`${$ex} = $.error.value;`);
                emitter.emitStmt(stmt.handler.body);
            }
            else {
                emitter.emitText(`throw $.error.value;`);
            }
            emitter.emitCase(altLabel);
            emitter.emitJump(JumpTarget.AfterTry);

            // finally sub-block
            emitter.emitCase(finallyLabel);
            emitter.emitText(`$.error.handler = '${emitter.currentThrowTarget}';`);
            if (stmt.finalizer) emitter.emitStmt(stmt.finalizer);
            emitter.emitText(`$.pos = '@finalize';`);
            emitter.emitText('continue');

            // block exit
            emitter.emitCase(exitLabel);
            emitter.popJumpTarget(2); // AfterTry & Finalize
        },

        LabeledStatement: (stmt) => {
            var entryLabel = '@' + stmt.label.name + '-entry';
            var exitLabel = '@' + stmt.label.name + '-exit';
            emitter.pushJumpTarget(JumpTarget.Break, exitLabel);
            emitter.pushJumpTarget(JumpTarget.Continue, entryLabel);
            emitter.emitCase(entryLabel);
            emitter.emitStmt(stmt.body);
            emitter.emitCase(exitLabel);
            emitter.popJumpTarget(2);
        },

        BreakStatement: (stmt) => {
            if (stmt.label) var label = '@' + stmt.label.name + '-exit';
            emitter.emitJump(JumpTarget.Break, label);
        },

        ContinueStatement: (stmt) => {
            if (stmt.label) var label = '@' + stmt.label.name + '-entry';
            emitter.emitJump(JumpTarget.Continue, label);
        },

        ReturnStatement: (stmt) => {
            if (stmt.argument) {
                emitter.emitExpr(stmt.argument, '$.result');
            }
            else {
                emitter.emitText(`$.result = void 0;`);
            }
            emitter.emitJump(JumpTarget.Return);
        },

        ThrowStatement: (stmt) => {
            var $arg = emitter.reserveTemporaryIdentifier('arg');
            emitter.emitExpr(stmt.argument, $arg);
            emitter.emitText(`throw ${$arg};`);
            emitter.releaseTemporaryIdentifier($arg);
        },

        VariableDeclaration: (stmt) => {
            stmt.declarations.forEach(decl => {
                if (decl.id.type !== 'Identifier') throw new Error(`Steppable: unsupported declarator ID type: '${decl.id.type}'`);
                var $name = emitter.getIdentifierReference(decl.id['name']);
                if (decl.init) emitter.emitExpr(decl.init, $name);
            });
        },

        FunctionDeclaration: (decl) => {
            emitter.emitFunc(decl);
        },

        Otherwise: (stmt) => {
            throw new Error(`Steppable: unsupported statement type: '${stmt.type}'`);
        }
    });
}


// TODO: doc...
function rewriteExpression(expr: t.Expression, $tgt: string, emitter: Rewriter): void {
    matchNode(expr, {

        SequenceExpression: (expr) => {
            expr.expressions.forEach(expr => {
                emitter.emitExpr(expr, $tgt);
            });
        },

        YieldExpression: (expr) => {
            var resumeLabel = emitter.newLabel();
            var yieldLabel = emitter.newLabel();
            var throwLabel = emitter.newLabel();
            var returnLabel = emitter.newLabel();
            emitter.emitText(`$.outgoing = { type: 'yield' };`);
            var arg = expr.argument || t.unaryExpression('void', t.numericLiteral(0), true);
            emitter.emitExpr(arg, '$.outgoing.value');
            emitter.temporaryIdentifierPool.forEach(id => emitter.emitText(`delete ${id};`));
            if (emitter.isTemporaryIdentifier($tgt)) emitter.emitText(`delete ${$tgt};`);
            emitter.emitText(`$.pos = '${resumeLabel}';`);
            emitter.emitText('return;');
            emitter.emitCase(resumeLabel);
            emitter.emitText(`$.pos = { yield: '${yieldLabel}', throw: '${throwLabel}', return: '${returnLabel}' }[$.incoming.type];`);
            emitter.emitText('continue;');
            emitter.emitCase(throwLabel);
            emitter.emitText(`throw $.incoming.value;`);
            emitter.emitCase(returnLabel);
            emitter.emitText(`$.result = $.incoming.value;`);
            emitter.emitJump(JumpTarget.Return);
            emitter.emitCase(yieldLabel);
            emitter.emitText(`${$tgt} = $.incoming.value;`);
        },

        AssignmentExpression: (expr) => {
            // NB: order of evaluation for 'a[b] += c' is: a then b then c 
            var $rhs = emitter.reserveTemporaryIdentifier('rhs');
            var $obj = emitter.reserveTemporaryIdentifier('obj');
            var $key = emitter.reserveTemporaryIdentifier('key');
            if (expr.left.type === 'Identifier') {
                var lhsText: string = emitter.getIdentifierReference(expr.left['name']);
            }
            else if (expr.left.type === 'MemberExpression') {
                var left = <t.MemberExpression> expr.left;
                emitter.emitExpr(left.object, $obj);
                if (left.computed) {
                    emitter.emitExpr(left.property, $key);
                }
                else {
                    emitter.emitText(`${$key} = '${left.property['name']}';`);
                }
                var lhsText = `${$obj}[${$key}]`;
            }
            else {
                throw new Error(`Steppable: unsupported l-value type: '${expr.left.type}'`);
            }
            emitter.emitExpr(expr.right, $rhs);
            emitter.emitText(`${$tgt} = ${lhsText} ${expr.operator} ${$rhs};`);
            emitter.releaseTemporaryIdentifier($rhs);
            emitter.releaseTemporaryIdentifier($obj);
            emitter.releaseTemporaryIdentifier($key);
        },

        ConditionalExpression: (expr) => {
            var conLabel = emitter.newLabel();
            var altLabel = emitter.newLabel();
            var exitLabel = emitter.newLabel();
            var $test = emitter.reserveTemporaryIdentifier('test');
            emitter.emitExpr(expr.test, $test);
            emitter.emitText(`$.pos = ${$test} ? '${conLabel}' : '${altLabel}';`);
            emitter.releaseTemporaryIdentifier($test);
            emitter.emitText(`continue;`);
            emitter.emitCase(conLabel);
            emitter.emitExpr(expr.consequent, $tgt);
            emitter.emitText(`$.pos = '${exitLabel}';`);
            emitter.emitText(`continue;`);
            emitter.emitCase(altLabel);
            emitter.emitExpr(expr.alternate, $tgt);
            emitter.emitCase(exitLabel);
        },

        LogicalExpression: (expr) => {
            var rhsLabel = emitter.newLabel();
            var exitLabel = emitter.newLabel();
            emitter.emitExpr(expr.left, $tgt);
            emitter.emitText(`$.pos = ${expr.operator === '&&' ? '' : '!'}${$tgt} ? '${rhsLabel}' : '${exitLabel}';`);
            emitter.emitText('continue;');
            emitter.emitCase(rhsLabel);
            emitter.emitExpr(expr.right, $tgt);
            emitter.emitCase(exitLabel);
        },

        BinaryExpression: (expr) => {
            var $lhs = emitter.reserveTemporaryIdentifier('lhs');
            var $rhs = emitter.reserveTemporaryIdentifier('rhs');
            emitter.emitExpr(expr.left, $lhs);
            emitter.emitExpr(expr.right, $rhs);
            emitter.emitText(`${$tgt} = ${$lhs} ${expr.operator} ${$rhs};`);
            emitter.releaseTemporaryIdentifier($lhs);
            emitter.releaseTemporaryIdentifier($rhs);
        },

        UnaryExpression: (expr) => {
            emitter.emitExpr(expr.argument, $tgt);
            emitter.emitText(`${$tgt} = ${expr.prefix ? expr.operator : ''} ${$tgt} ${expr.prefix ? '' : expr.operator};`);
        },

        UpdateExpression: (expr) => {
            var $obj = emitter.reserveTemporaryIdentifier('obj');
            var $key = emitter.reserveTemporaryIdentifier('key');
            if (expr.argument.type === 'Identifier') {
                var argText: string = emitter.getIdentifierReference(expr.argument['name']);
            }
            else if (expr.argument.type === 'MemberExpression') {
                var arg = <t.MemberExpression> expr.argument;
                emitter.emitExpr(arg.object, $obj);
                if (arg.computed) {
                    emitter.emitExpr(arg.property, $key);
                }
                else {
                    emitter.emitText(`${$key} = '${arg.property['name']}';`);
                }
                var argText = `${$obj}[${$key}]`;
            }
            else {
                throw new Error(`Steppable: unsupported l-value type: '${expr.argument.type}`);
            }
            var pre = expr.prefix ? expr.operator : '';
            var post = expr.prefix ? '' : expr.operator;
            emitter.emitText(`${$tgt} = ${pre}${argText}${post};`);
            emitter.releaseTemporaryIdentifier($obj);
            emitter.releaseTemporaryIdentifier($key);
        },

        CallExpression: (expr) => {
            var $receiver = emitter.reserveTemporaryIdentifier('receiver');
            var $func = emitter.reserveTemporaryIdentifier('func');
            var $args = emitter.reserveTemporaryIdentifier('args');
            var $arg = emitter.reserveTemporaryIdentifier('arg');
            if (t.isMemberExpression(expr.callee)) {
                emitter.emitExpr(expr.callee.object, $receiver);
                if (expr.callee.computed) {
                    emitter.emitExpr(expr.callee.property, $func);
                    emitter.emitText(`${$func} = ${$receiver}[${$func}];`);
                }
                else {
                    emitter.emitText(`${$func} = ${$receiver}['${expr.callee.property['name']}'];`);
                }
            }
            else {
                emitter.emitText(`${$receiver} = null;`);
                emitter.emitExpr(expr.callee, $func);
            }
            emitter.emitText(`${$args} = [];`);
            for (var i = 0; i < expr.arguments.length; ++i) {
                let arg = <t.Expression> expr.arguments[i]; // TODO: unsafe cast - what about ES6 SpreadElement etc?
                emitter.emitExpr(arg, $arg);
                emitter.emitText(`${$args}.push(${$arg});`);
            }
            emitter.emitText(`${$tgt} = ${$func}.apply(${$receiver}, ${$args});`);
            emitter.releaseTemporaryIdentifier($receiver);
            emitter.releaseTemporaryIdentifier($func);
            emitter.releaseTemporaryIdentifier($args);
            emitter.releaseTemporaryIdentifier($arg);
        },

        NewExpression: (expr) => {
            var $func = emitter.reserveTemporaryIdentifier('func');
            var $args = emitter.reserveTemporaryIdentifier('args');
            var $arg = emitter.reserveTemporaryIdentifier('arg');
            emitter.emitExpr(expr.callee, $func);
            emitter.emitText(`${$args} = [];`);
            for (var i = 0; i < expr.arguments.length; ++i) {
                let arg = <t.Expression> expr.arguments[i]; // TODO: unsafe cast - what about ES6 SpreadElement etc?
                emitter.emitExpr(arg, $arg);
                emitter.emitText(`${$args}.push(${$arg});`);
            }
            emitter.emitText(`${$tgt} = Object.create(${$func}.prototype);`);
            emitter.emitText(`${$tgt} = ${$func}.apply(${$tgt}, ${$args}) || ${$tgt};`);
            emitter.releaseTemporaryIdentifier($func);
            emitter.releaseTemporaryIdentifier($args);
            emitter.releaseTemporaryIdentifier($arg);
        },

        MemberExpression: (expr) => {
            var $obj = emitter.reserveTemporaryIdentifier('obj');
            emitter.emitExpr(expr.object, $obj);
            if (expr.computed) {
                var $key = emitter.reserveTemporaryIdentifier('key');
                emitter.emitExpr(expr.property, $key);
                emitter.emitText(`${$tgt} = ${$obj}[${$key}];`);
                emitter.releaseTemporaryIdentifier($key);
            }
            else {
                emitter.emitText(`${$tgt} = ${$obj}['${expr.property['name']}'];`);
            }
            emitter.releaseTemporaryIdentifier($obj);
        },

        ArrayExpression: (expr) => {
            var $elem = emitter.reserveTemporaryIdentifier('elem');
            emitter.emitText(`${$tgt} = [];`);
            for (var i = 0; i < expr.elements.length; ++i) {
                let elem = <t.Expression> expr.elements[i]; // TODO: unsafe cast - what about ES6 SpreadElement etc?
                emitter.emitExpr(elem, $elem);
                emitter.emitText(`${$tgt}.push(${$elem});`);
            }
            emitter.releaseTemporaryIdentifier($elem);
        },

        ObjectExpression: (expr) => {
            var $key = emitter.reserveTemporaryIdentifier('key');
            emitter.emitText(`${$tgt} = {};`);
            for (var i = 0; i < expr.properties.length; ++i) {
                var prop = expr.properties[i];
                if (t.isObjectProperty(prop)) {
                    if (t.isIdentifier(prop.key)) {
                        emitter.emitText(`${$key} = '${prop.key['name']}';`);
                    }
                    else {
                        emitter.emitExpr(prop.key, $key);
                    }
                    emitter.emitExpr(prop.value, `${$tgt}[${$key}]`);
                }
                else {
                    // TODO: handle other cases... just throw for now
                    t.assertObjectProperty(prop);
                }
            }
            emitter.releaseTemporaryIdentifier($key);
        },

        Identifier: (expr) => {
            var $name = emitter.getIdentifierReference(expr.name);
            return emitter.emitText(`${$tgt} = ${$name};`);
        },

        TemplateLiteral: (expr) => {
            var $expr = emitter.reserveTemporaryIdentifier('expr');
            emitter.emitText(`${$tgt} = '';`);
            for (var i = 0; i < expr.expressions.length; ++i) {
                emitter.emitText(`${$tgt} += ${JSON.stringify(expr.quasis[i].value.cooked)};`);
                emitter.emitExpr(expr.expressions[i], $expr);
                emitter.emitText(`${$tgt} += ${$expr};`);
            }
            emitter.emitText(`${$tgt} += ${JSON.stringify(expr.quasis[i].value.cooked)};`);
            emitter.releaseTemporaryIdentifier($expr);
        },

        NumericLiteral: (expr) => {
            emitter.emitText(`${$tgt} = ${JSON.stringify(expr.value)};`);
        },
        StringLiteral: (expr) => {
            emitter.emitText(`${$tgt} = ${JSON.stringify(expr.value)};`);
        },
        BooleanLiteral: (expr) => {
            emitter.emitText(`${$tgt} = ${JSON.stringify(expr.value)};`);
        },
        RegExpLiteral: (expr) => {
            emitter.emitText(`${$tgt} = /${expr.pattern}/${expr.flags}`);
        },

        Otherwise: (expr) => {
            throw new Error(`Steppable: unsupported expression type: '${expr.type}'`);
        }
    });
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

        Otherwise: (node) => {
            throw new Error(`traverseTree: unsupported node type: '${node.type}'`);
        }
    });
}
