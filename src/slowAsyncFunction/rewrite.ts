import assert = require('assert');
import _ = require('lodash');
import esprima = require('esprima');
import match = require('./match');
export = rewrite;


// TODO: ensure no clash of user vars with emitter vars
// TODO: ensure no clash of user labels with emitter labels
// TODO: graceful checking & feedback of unsupported constructs
// TODO: 'closure variable' handling
// TODO: 'await()' handling
// TODO: emit prolog, epilog, checkpoints (DB access)
// TODO: normal Promise/async call interop
// TODO: disallow references to 'arguments' (or allow?) and ALL non-locally-defined vars (except a few safe globals?)
// TODO: disallow local-scoped vars (let & const) inside blocks - as these would break the assumed save/load behaviour of localVars -or- fix in emitted code somehow
//       - NB: in 'catch (ex) {...}' ex is a local var, but must be allowed (current emitter code supports this)
// TODO: source maps


// TODO: temp testing...
function rewrite(funcExpr: ESTree.FunctionExpression, options?: {}): ESTree.FunctionExpression {
    assert(!funcExpr.generator)
    assert(funcExpr.params.every(p => p.type === 'Identifier'));
    assert(funcExpr.body.type === 'BlockStatement');
    var rewriter = new Rewriter();
    funcExpr.params.forEach(p => rewriter.declareLocalIdentifier(p['name'])); // TODO: review this...
    rewriter.emitStmt(funcExpr.body);
    var newFuncExpr = <ESTree.FunctionExpression> rewriter.generateAST();
    newFuncExpr.params = funcExpr.params;
    return newFuncExpr;
}


// TODO: temp testing...
class Rewriter {

    constructor() {
        this.emitCase(this.newLabel());
        this.pushJumpTarget(JumpTarget.Throw, '@fail');
        this.pushJumpTarget(JumpTarget.Return, '@done');
    }

    // TODO: was...
    //localVars: string[] = ['$state', '$pos', '$result', '$error', '$finalizers'];
    whitelistedNonlocalIdentifiers = [
        'Error',
        'Infinity'
        // TODO: list all!!!
    ];


    currentThrowTarget: string;

    // TODO: temp testing...
    declareLocalIdentifier(name: string): string {
        // TODO: temp testing...
        return this.referenceLocalIdentifier(name);
    }

    // TODO: temp testing...
    referenceLocalIdentifier(name: string): string {
        // TODO: temp testing...
        var isNonlocal = this.whitelistedNonlocalIdentifiers.indexOf(name) !== -1;
        if (isNonlocal) return name;
        return '$state.locals.' + name;
    }

    reserveName(name: string): string {
        // TODO: test/step through
        for (var i = 0, isNameAvailable = false; !isNameAvailable; ++i) {
            var fullName = name + (i || '');
            isNameAvailable = this.reservedNames.indexOf(fullName) === -1;
        }
        this.reservedNames.push(fullName);
        return '$state.' + fullName;
    }

    releaseName(name: string): void {
        var i = this.reservedNames.indexOf(name);
        this.reservedNames.splice(i, 1);
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
            this.emitText(`$finalizers.pending = ['${finalizers.join("', '")}'];`);
            this.emitText(`$finalizers.afterward = '${label}';`);
            this.emitText(`$pos = '@finalize';`);
            this.emitText('continue;');
        }
        else {
            this.emitText(`$pos = '${label}';`);
            this.emitText('continue;');
        }
    }

    generateAST(fromFragment?: string): ESTree.FunctionExpression | ESTree.Statement {
        var source = `
            (function slowAsyncFunctionBody() {
                var $state, $pos, $error, $finalizers, $result;
                $state = { locals: {} }, $pos = '@start', $error = { handler: '@fail' }, $finalizers = {};
                $main:
                while (true) {
                    try {
                        switch ($pos) {
                            case '@start':
                                ${fromFragment || ''}
                            case '@done':
                                break $main;
                            case '@fail':
                                // TODO: ...
                                '========== TODO ==========';
                            case '@finalize':
                                $pos = $finalizers.pending.pop() || $finalizers.afterward;
                                continue;
                        }
                    }
                    catch (ex) {
                        $error.occurred = true;
                        $error.value = ex;
                        $pos = $error.handler;
                        continue;
                    }
                    finally {
                    }
                }
                return $result;
            })
        `;
        var ast = esprima.parse(source);
        var funcExpr = <ESTree.FunctionExpression> ast.body[0]['expression'];
        var labelStmt = <ESTree.LabeledStatement> funcExpr.body['body'][2];
        var whileStmt = <ESTree.WhileStatement> labelStmt.body;
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

    private reservedNames = ['locals']; // TODO: review this... correct?

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
            var $void = emitter.reserveName('void');
            emitter.emitExpr(stmt.expression, $void);
            emitter.releaseName($void);
        },

        IfStatement: (stmt) => {
            var conLabel = emitter.newLabel();
            var altLabel = emitter.newLabel();
            var exitLabel = emitter.newLabel();
            var $test = emitter.reserveName('test');
            emitter.emitExpr(stmt.test, $test);
            emitter.emitText(`$pos = ${$test} ? '${conLabel}' : '${altLabel}';`);
            emitter.releaseName($test);
            emitter.emitText(`continue;`);
            emitter.emitCase(conLabel);
            emitter.emitStmt(stmt.consequent);
            emitter.emitText(`$pos = '${exitLabel}';`);
            emitter.emitText(`continue;`);
            emitter.emitCase(altLabel);
            if (stmt.alternate) emitter.emitStmt(stmt.alternate);
            emitter.emitCase(exitLabel);
        },

        SwitchStatement: (stmt) => {
            var exitLabel = emitter.newLabel();
            emitter.pushJumpTarget(JumpTarget.Break, exitLabel);
            var $discriminant = emitter.reserveName('discriminant');
            var $test = emitter.reserveName('test');
            emitter.emitExpr(stmt.discriminant, $discriminant);
            stmt.cases.forEach(switchCase => {
                var matchLabel = emitter.newLabel();
                var skipLabel = emitter.newLabel();
                if (switchCase.test) {
                    emitter.emitExpr(switchCase.test, $test);
                    emitter.emitText(`$pos = ${$discriminant} === ${$test} ? '${matchLabel}' : '${skipLabel}'`);
                    emitter.emitText('continue;');
                }
                emitter.emitCase(matchLabel);
                switchCase.consequent.forEach(stmt => emitter.emitStmt(stmt));
                emitter.emitCase(skipLabel);
            });
            emitter.emitCase(exitLabel);
            emitter.releaseName($discriminant);
            emitter.releaseName($test);
            emitter.popJumpTarget();
        },

        WhileStatement: (stmt) => {
            var entryLabel = emitter.newLabel();
            var iterLabel = emitter.newLabel();
            var exitLabel = emitter.newLabel();
            emitter.pushJumpTarget(JumpTarget.Break, exitLabel);
            emitter.pushJumpTarget(JumpTarget.Continue, entryLabel);
            emitter.emitCase(entryLabel);
            var $test = emitter.reserveName('test');
            emitter.emitExpr(stmt.test, $test);
            emitter.emitText(`$pos = ${$test} ? '${iterLabel}' : '${exitLabel}';`);
            emitter.releaseName($test);
            emitter.emitText(`continue;`);
            emitter.emitCase(iterLabel);
            emitter.emitStmt(stmt.body);
            emitter.emitText(`$pos = '${entryLabel}';`);
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
            var $test = emitter.reserveName('test');
            emitter.emitExpr(stmt.test, $test);
            emitter.emitText(`$pos = ${$test} ? '${entryLabel}' : '${exitLabel}';`);
            emitter.releaseName($test);
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
                    var $void = emitter.reserveName('void');
                    emitter.emitExpr(stmt.init, $void);
                    emitter.releaseName($void);
                }
            }
            emitter.emitCase(entryLabel);
            if (stmt.test) {
                var $test = emitter.reserveName('test');
                emitter.emitExpr(stmt.test, $test);
                emitter.emitText(`$pos = ${$test} ? '${iterLabel}' : '${exitLabel}';`);
                emitter.releaseName($test);
                emitter.emitText(`continue;`);
            }
            emitter.emitCase(iterLabel);
            emitter.emitStmt(stmt.body);
            if (stmt.update) {
                var $void = emitter.reserveName('void');
                emitter.emitExpr(stmt.update, $void);
                emitter.releaseName($void);
            }
            emitter.emitText(`$pos = '${entryLabel}';`);
            emitter.emitText(`continue;`);
            emitter.emitCase(exitLabel);
            emitter.popJumpTarget(2);
        },

        ForInStatement: (stmt) => {
            var loopVar = stmt.left.type === 'VariableDeclaration' ? stmt.left['declarations'][0].id : stmt.left;
            if (loopVar.type !== 'Identifier') throw new Error(`slowfunc: unsupported for..in loop variable type: '${loopVar.type}'`);
            if (stmt.left.type === 'VariableDeclaration') {
                if (stmt.left['declarations'][0].init) throw new Error(`slowfunc: for..in loop variable initialiser is not supported.`);
                emitter.declareLocalIdentifier(loopVar.name);
            }
            var $name: string = loopVar.name;
            var $obj = emitter.reserveName('obj');
            var $props = emitter.reserveName('props');
            var $i = emitter.reserveName('i');
            emitter.emitExpr(stmt.right, $obj);
            var $o = emitter.reserveName('o');
            emitter.emitText(`for (${$o} = ${$obj}, ${$props} = []; ${$o}; ${$props} = ${$props}.concat(Object.keys(${$o})), ${$o} = ${$o}.prototype) ;`);
            emitter.releaseName('$o');
            var forStmt = <ESTree.ForStatement> esprima.parse(`for (${$i} = 0; ${$i} < ${$props}.length; ++${$i}) { ${$name} = ${$props}[${$i}]; }`).body[0];
            var forBody = (<ESTree.BlockStatement> forStmt.body);
            forBody.body = forBody.body.concat(stmt.body.type === 'BlockStatement' ? stmt.body['body'] : stmt.body);
            emitter.emitStmt(forStmt);
            emitter.releaseName('$obj');
            emitter.releaseName('$props');
            emitter.releaseName('$i');
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
            emitter.emitText(`$error.handler = '${emitter.currentThrowTarget}';`);
            emitter.emitText(`$error.occurred = false;`);
            emitter.emitStmt(stmt.block);
            emitter.emitCase(catchLabel);
            emitter.popJumpTarget(); // Throw
            emitter.emitText(`$error.handler = '${emitter.currentThrowTarget}';`);
            emitter.emitText(`$pos = $error.occurred ? '${conLabel}' : '${altLabel}';`);
            emitter.emitText('continue;');
            emitter.emitCase(conLabel);
            if (stmt.handler) {
                if (stmt.handler.param.type !== 'Identifier') throw new Error(`slowfunc: catch parameter must be an identifier`);
                var $ex = emitter.declareLocalIdentifier(stmt.handler.param['name']);
                emitter.emitText(`${$ex} = $error.value;`);
                emitter.emitStmt(stmt.handler.body);
            }
            else {
                emitter.emitText(`throw $error.value;`);
            }
            emitter.emitCase(altLabel);
            emitter.emitJump(JumpTarget.AfterTry);

            // finally sub-block
            emitter.emitCase(finallyLabel);
            emitter.emitText(`$error.handler = '${emitter.currentThrowTarget}';`);
            if (stmt.finalizer) emitter.emitStmt(stmt.finalizer);
            emitter.emitText(`$pos = '@finalize';`);
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
                emitter.emitExpr(stmt.argument, '$result');
            }
            else {
                emitter.emitText(`$result = void 0;`);
            }
            emitter.emitJump(JumpTarget.Return);
        },

        ThrowStatement: (stmt) => {
            var $arg = emitter.reserveName('arg');
            emitter.emitExpr(stmt.argument, $arg);
            emitter.emitText(`throw ${$arg};`);
            emitter.releaseName($arg);
        },

        VariableDeclaration: (stmt) => {
            stmt.declarations.forEach(decl => {
                if (decl.id.type !== 'Identifier') throw new Error(`slowfunc: unsupported declarator ID type: '${decl.id.type}'`);
                var $name = emitter.declareLocalIdentifier(decl.id['name']);
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

        AssignmentExpression: (expr) => {
            // NB: order of evaluation for 'a[b] += c' is: a then b then c 
            var $rhs = emitter.reserveName('rhs');
            var $obj = emitter.reserveName('obj');
            var $key = emitter.reserveName('key');
            if (expr.left.type === 'Identifier') {
                var lhsText: string = emitter.referenceLocalIdentifier(expr.left['name']);
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
            emitter.releaseName($rhs);
            emitter.releaseName($obj);
            emitter.releaseName($key);
        },

        ConditionalExpression: (expr) => {
            var conLabel = emitter.newLabel();
            var altLabel = emitter.newLabel();
            var exitLabel = emitter.newLabel();
            var $test = emitter.reserveName('test');
            emitter.emitExpr(expr.test, $test);
            emitter.emitText(`$pos = ${$test} ? '${conLabel}' : '${altLabel}';`);
            emitter.releaseName($test);
            emitter.emitText(`continue;`);
            emitter.emitCase(conLabel);
            emitter.emitExpr(expr.consequent, $tgt);
            emitter.emitText(`$pos = '${exitLabel}';`);
            emitter.emitText(`continue;`);
            emitter.emitCase(altLabel);
            emitter.emitExpr(expr.alternate, $tgt);
            emitter.emitCase(exitLabel);
        },

        LogicalExpression: (expr) => {
            var rhsLabel = emitter.newLabel();
            var exitLabel = emitter.newLabel();
            emitter.emitExpr(expr.left, $tgt);
            emitter.emitText(`$pos = ${expr.operator === '&&' ? '' : '!'}${$tgt} ? '${rhsLabel}' : '${exitLabel}';`);
            emitter.emitText('continue;');
            emitter.emitCase(rhsLabel);
            emitter.emitExpr(expr.right, $tgt);
            emitter.emitCase(exitLabel);
        },

        BinaryExpression: (expr) => {
            var $lhs = emitter.reserveName('lhs');
            var $rhs = emitter.reserveName('rhs');
            emitter.emitExpr(expr.left, $lhs);
            emitter.emitExpr(expr.right, $rhs);
            emitter.emitText(`${$tgt} = ${$lhs} ${expr.operator} ${$rhs};`);
            emitter.releaseName($lhs);
            emitter.releaseName($rhs);
        },

        UnaryExpression: (expr) => {
            emitter.emitExpr(expr.argument, $tgt);
            emitter.emitText(`${$tgt} = ${expr.prefix ? expr.operator : ''} ${$tgt} ${expr.prefix ? '' : expr.operator};`);
        },

        UpdateExpression: (expr) => {
            var $obj = emitter.reserveName('obj');
            var $key = emitter.reserveName('key');
            if (expr.argument.type === 'Identifier') {
                var argText: string = emitter.referenceLocalIdentifier(expr.argument['name']);
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
            emitter.releaseName($obj);
            emitter.releaseName($key);
        },

        CallExpression: (expr) => {
            var $receiver = emitter.reserveName('receiver');
            var $func = emitter.reserveName('func');
            var $args = emitter.reserveName('args');
            var $arg = emitter.reserveName('arg');
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
            emitter.releaseName($receiver);
            emitter.releaseName($func);
            emitter.releaseName($args);
            emitter.releaseName($arg);
        },

        NewExpression: (expr) => {
            var $func = emitter.reserveName('func');
            var $args = emitter.reserveName('args');
            var $arg = emitter.reserveName('arg');
            emitter.emitExpr(expr.callee, $func);
            emitter.emitText(`${$args} = [];`);
            for (var i = 0; i < expr.arguments.length; ++i) {
                emitter.emitExpr(expr.arguments[i], $arg);
                emitter.emitText(`${$args}.push(${$arg});`);
            }
            emitter.emitText(`${$tgt} = Object.create(${$func}.prototype);`);
            emitter.emitText(`${$tgt} = ${$func}.apply(${$tgt}, ${$args}) || ${$tgt};`);
            emitter.releaseName($func);
            emitter.releaseName($args);
            emitter.releaseName($arg);
        },

        MemberExpression: (expr) => {
            var $obj = emitter.reserveName('obj');
            emitter.emitExpr(expr.object, $obj);
            if (expr.computed) {
                var $key = emitter.reserveName('key');
                emitter.emitExpr(expr.property, $key);
                emitter.emitText(`${$tgt} = ${$obj}[${$key}];`);
                emitter.releaseName($key);
            }
            else {
                emitter.emitText(`${$tgt} = ${$obj}['${expr.property['name']}'];`);
            }
            emitter.releaseName($obj);
        },

        ArrayExpression: (expr) => {
            var $elem = emitter.reserveName('elem');
            emitter.emitText(`${$tgt} = [];`);
            for (var i = 0; i < expr.elements.length; ++i) {
                emitter.emitExpr(expr.elements[i], $elem);
                emitter.emitText(`${$tgt}.push(${$elem});`);
            }
            emitter.releaseName($elem);
        },

        ObjectExpression: (expr) => {
            var $key = emitter.reserveName('key');
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
            emitter.releaseName($key);
        },

        Identifier: (expr) => {

            // TODO: what if it is a non-local identifier???
            var $name = emitter.referenceLocalIdentifier(expr.name);
            return emitter.emitText(`${$tgt} = ${$name};`);
        },

        TemplateLiteral: (expr) => {
            var $expr = emitter.reserveName('expr');
            emitter.emitText(`${$tgt} = '';`);
            for (var i = 0; i < expr.expressions.length; ++i) {
                emitter.emitText(`${$tgt} += ${JSON.stringify(expr.quasis[i].value.cooked)};`);
                emitter.emitExpr(expr.expressions[i], $expr);
                emitter.emitText(`${$tgt} += ${$expr};`);
            }
            emitter.emitText(`${$tgt} += ${JSON.stringify(expr.quasis[i].value.cooked)};`);
            emitter.releaseName($expr);
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
