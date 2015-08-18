import assert = require('assert');
import _ = require('lodash');
import esprima = require('esprima');
import match = require('./match');


// TODO: graceful checking & feedback of unsupported constructs
// TODO: 'closure variable' handling
// TODO: 'await()' handling
// TODO: emit prolog, epilog, checkpoints (DB access)
// TODO: normal Promise/async call interop
// TODO: disallow references to 'arguments' (or allow?) and ALL non-locally-defined vars (except a few safe globals?)
// TODO: disallow local-scoped vars (let & const) inside blocks - as these would break the assumed save/load behaviour of localVars -or- fix in emitted code somehow
//       - NB: in 'catch (ex) {...}' ex is a local var, but must be allowed (current emitter code supports this)
// TODO: source maps
// TODO: serialization: preserve difference between 'null' and 'undefined'


// TODO: temp testing...
export function rewrite(funcExpr: ESTree.FunctionExpression, nonlocalIdentifierNames: string[]): ESTree.FunctionExpression {

    // TODO: ...
    // TODO: test then remove... was... assert(!funcExpr.generator);
    assert(funcExpr.params.every(p => p.type === 'Identifier'));
    assert(funcExpr.body.type === 'BlockStatement');

    // TODO: ...
    var rewriter = new Rewriter(<any> funcExpr.body, <any> funcExpr.params, nonlocalIdentifierNames);
    var newFuncExpr = <ESTree.FunctionExpression> rewriter.generateAST();
    //TODO: remove:   was... newFuncExpr.params = funcExpr.params;
    return newFuncExpr;
}


// TODO: doc... this is the shape of the '$' state object inside the rewritten slow function's body
// TODO: unused... keep? just for documentation purposes?
export interface State {

    pos?: string;

    local?: { [name: string]: any; };

    temp?: { [name: string]: any; };

    error?: {
        occurred?: boolean;
        value?: any;
        handler?: string;
    };

    finalizers?: {
        pending?: string[];
        afterward?: string;
    };

    incoming?: { type?: string; /* 'yield'|'throw'|'return' */ value?: any; };

    outgoing?: { type?: string; /* 'yield'|'throw'|'return' */ value?: any; };
}


// TODO: doc...
class Rewriter {

    constructor(body: ESTree.BlockStatement, params: ESTree.Identifier[], private nonlocalIdentifierNames: string[]) {

        // Initialise state.
        this.emitCase(this.newLabel());
        this.pushJumpTarget(JumpTarget.Throw, '@fail');
        this.pushJumpTarget(JumpTarget.Return, '@done');

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

    getIdentifierReference(name: string): string {
        var isNonlocal = this.nonlocalIdentifierNames.indexOf(name) !== -1;
        return isNonlocal ? name : '$.local.' + name;
    }

    reserveTemporaryIdentifier(name: string): string {
        for (var i = 0, isNameAvailable = false; !isNameAvailable; ++i) {
            var fullName = name + (i || '');
            isNameAvailable = this.temporaryIdentifiersInUse.indexOf(fullName) === -1;
        }
        this.temporaryIdentifiersInUse.push(fullName);
        return '$.temp.' + fullName;
    }

    releaseTemporaryIdentifier(name: string): void {
        var i = this.temporaryIdentifiersInUse.indexOf(name);
        this.temporaryIdentifiersInUse.splice(i, 1);
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
                var label = _.findLast(this.jumpTargets, tgt => tgt.type === JumpTarget.Throw).value;
                this.currentThrowTarget = label;
            }
        }
    }

    emitCase(label: string) {
        var newCase = { type: 'SwitchCase', test: { type: 'Literal', value: label }, consequent: [] };
        this.switchCases.push(newCase);
    }

    emitText(text: string) {
        var stmt = this.generateAST(text);
        this.switchCases[this.switchCases.length - 1].consequent.push(stmt);
    }

    emitStmt(stmt: ESTree.Statement) {
        rewriteStatement(stmt, this);
    }

    emitExpr(expr: ESTree.Expression, $tgt: string) {
        rewriteExpression(expr, $tgt, this);
    }

    emitJump(type: JumpTarget, value?: string) {
        var i = _.findLastIndex(this.jumpTargets, tgt => tgt.type === type && (!value || tgt.value === value));
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

    generateAST(fromFragment?: string): ESTree.FunctionExpression | ESTree.Statement {
        var source = `
            (function slowRoutineBody($) {
                $.pos = $.pos || '@start';
                $.local = $.local || {};
                $.temp = $.temp || {};
                $.error = $.error || { handler: '@fail' };
                $.finalizers = $.finalizers || { pending: [] };
                $.incoming = $.incoming || { type: 'yield' };
                $.outgoing = $.outgoing || { type: 'return' };
                while (true) {
                    try {
                        switch ($.pos) {
                            case '@start':
                                ${fromFragment || ''}
                            case '@done':
                                $.outgoing.type = 'return';
                                return;
                            case '@fail':
                                $.outgoing.type = 'throw';
                                $.outgoing.value = $.error.value;
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
        var ast = esprima.parse(source);
        var funcExpr = <ESTree.FunctionExpression> ast.body[0]['expression'];
        var whileStmt = <ESTree.WhileStatement> funcExpr.body['body'][7];
        var tryStmt = <ESTree.TryStatement> whileStmt.body['body'][0];
        var switchStmt = <ESTree.SwitchStatement> tryStmt.block['body'][0];
        if (fromFragment) {
            var stmts = switchStmt.cases[0].consequent;
            if (stmts.length === 1) return stmts[0];
            throw new Error('slowfunc: generateAST: fromFragment: expected a single statement');
        }
        else {
            switchStmt.cases.splice(1, 0, ...this.switchCases);
            return funcExpr;
        }
    }

    private temporaryIdentifiersInUse: string[] = [];

    private nextLabel = 0;

    private switchCases: ESTree.SwitchCase[] = [];

    private jumpTargets: { type: JumpTarget; value: string; }[] = [];
}


// TODO: temp testing...
enum JumpTarget {
    AfterTry,
    Break,
    Continue,
    Finalize,
    Return,
    Throw
}


// TODO: temp testing...
function rewriteStatement(stmt: ESTree.Statement, emitter: Rewriter): void {
    match(stmt, {

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
                if (stmt.init.type === 'VariableDeclaration') {
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
            if (loopVar.type !== 'Identifier') throw new Error(`slowfunc: unsupported for..in loop variable type: '${loopVar.type}'`);
            if (stmt.left.type === 'VariableDeclaration') {
                if (stmt.left['declarations'][0].init) throw new Error(`slowfunc: for..in loop variable initialiser is not supported.`);
                // TODO: remove.   was...   emitter.declareLocalIdentifier(loopVar.name);
            }
            var $name: string = loopVar.name;
            var $obj = emitter.reserveTemporaryIdentifier('obj');
            var $props = emitter.reserveTemporaryIdentifier('props');
            var $i = emitter.reserveTemporaryIdentifier('i');
            emitter.emitExpr(stmt.right, $obj);
            var $o = emitter.reserveTemporaryIdentifier('o');
            emitter.emitText(`for (${$o} = ${$obj}, ${$props} = []; ${$o}; ${$props} = ${$props}.concat(Object.keys(${$o})), ${$o} = ${$o}.prototype) ;`);
            emitter.releaseTemporaryIdentifier('$o');
            var forStmt = <ESTree.ForStatement> esprima.parse(`for (${$i} = 0; ${$i} < ${$props}.length; ++${$i}) { ${$name} = ${$props}[${$i}]; }`).body[0];
            var forBody = (<ESTree.BlockStatement> forStmt.body);
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
                if (stmt.handler.param.type !== 'Identifier') throw new Error(`slowfunc: catch parameter must be an identifier`);
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
                emitter.emitExpr(stmt.argument, '$.outgoing.value');
            }
            else {
                emitter.emitText(`$.outgoing.value = void 0;`);
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
                if (decl.id.type !== 'Identifier') throw new Error(`slowfunc: unsupported declarator ID type: '${decl.id.type}'`);
                var $name = emitter.getIdentifierReference(decl.id['name']);
                if (decl.init) emitter.emitExpr(decl.init, $name);
            });
        },

        Otherwise: (stmt) => {
            throw new Error(`slowfunc: unsupported statement type: '${stmt.type}'`);
        }
    });
}


// TODO: temp testing...
function rewriteExpression(expr: ESTree.Expression, $tgt: string, emitter: Rewriter): void {
    match(expr, {

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
            emitter.emitText(`$.outgoing.type = 'yield';`);
            if (expr.argument) {
                emitter.emitExpr(expr.argument, '$.outgoing.value');
            }
            else {
                emitter.emitText(`$.outgoing.value = void 0;`);
            }
            emitter.emitText(`$.pos = '${resumeLabel}';`);
            emitter.emitText('return;');
            emitter.emitCase(resumeLabel);
            emitter.emitText(`$.pos = { yield: '${yieldLabel}', throw: '${throwLabel}', return: '${returnLabel}' }[$.incoming.type];`);
            emitter.emitText('continue;');
            emitter.emitCase(throwLabel);
            emitter.emitText(`throw $.incoming.value;`);
            emitter.emitCase(returnLabel);
            emitter.emitText(`$.outgoing.value = $.incoming.value;`);
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
                var left = <ESTree.MemberExpression> expr.left;
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
                throw new Error(`slowfunc: unsupported l-value type: '${expr.left.type}'`);
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
                var arg = <ESTree.MemberExpression> expr.argument;
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
                throw new Error(`slowfunc: unsupported l-value type: '${expr.argument.type}`);
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
            if (expr.callee.type === 'MemberExpression') {
                var callee = <ESTree.MemberExpression> expr.callee;
                emitter.emitExpr(callee.object, $receiver);
                if (callee.computed) {
                    emitter.emitExpr(callee.property, $func);
                    emitter.emitText(`${$func} = ${$receiver}[${$func}];`);
                }
                else {
                    emitter.emitText(`${$func} = ${$receiver}['${callee.property['name']}'];`);
                }
            }
            else {
                emitter.emitText(`${$receiver} = null;`);
                emitter.emitExpr(expr.callee, $func);
            }
            emitter.emitText(`${$args} = [];`);
            for (var i = 0; i < expr.arguments.length; ++i) {
                emitter.emitExpr(expr.arguments[i], $arg);
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
                emitter.emitExpr(expr.arguments[i], $arg);
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
                emitter.emitExpr(expr.elements[i], $elem);
                emitter.emitText(`${$tgt}.push(${$elem});`);
            }
            emitter.releaseTemporaryIdentifier($elem);
        },

        ObjectExpression: (expr) => {
            var $key = emitter.reserveTemporaryIdentifier('key');
            emitter.emitText(`${$tgt} = {};`);
            for (var i = 0; i < expr.properties.length; ++i) {
                var prop = expr.properties[i];
                if (prop.key.type === 'Identifier') {
                    emitter.emitText(`${$key} = '${prop.key['name']}';`);
                }
                else {
                    emitter.emitExpr(prop.key, $key);
                }
                emitter.emitExpr(prop.value, `${$tgt}[${$key}]`);
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

        Literal: (expr) => {
            if (expr['regex']) {
                emitter.emitText(`${$tgt} = /${expr['regex'].pattern}/${expr['regex'].flags}`);
            }
            else {
                emitter.emitText(`${$tgt} = ${JSON.stringify(expr.value)};`);
            }
        },

        Otherwise: (expr) => {
            throw new Error(`slowfunc: unsupported expression type: '${expr.type}'`);
        }
    });
}
