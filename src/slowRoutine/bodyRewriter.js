var assert = require('assert');
var _ = require('lodash');
var esprima = require('esprima');
var match = require('./match');
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
function rewrite(funcExpr, nonlocalIdentifierNames) {
    // TODO: ...
    // TODO: test then remove... was... assert(!funcExpr.generator);
    assert(funcExpr.params.every(function (p) { return p.type === 'Identifier'; }));
    assert(funcExpr.body.type === 'BlockStatement');
    // TODO: ...
    var rewriter = new Rewriter(funcExpr.body, funcExpr.params, nonlocalIdentifierNames);
    var newFuncExpr = rewriter.generateAST();
    //TODO: remove:   was... newFuncExpr.params = funcExpr.params;
    return newFuncExpr;
}
exports.rewrite = rewrite;
// TODO: doc...
var Rewriter = (function () {
    function Rewriter(body, params, nonlocalIdentifierNames) {
        this.nonlocalIdentifierNames = nonlocalIdentifierNames;
        this.temporaryIdentifiersInUse = [];
        this.nextLabel = 0;
        this.switchCases = [];
        this.jumpTargets = [];
        // Initialise state.
        this.emitCase(this.newLabel());
        this.pushJumpTarget(JumpTarget.Throw, '@fail');
        this.pushJumpTarget(JumpTarget.Return, '@done');
        // Emit code to initially assign formal parameters from $.arguments.
        for (var i = 0; i < params.length; ++i) {
            var $paramName = this.getIdentifierReference(params[i].name);
            var $arguments = this.getIdentifierReference('arguments');
            this.emitText($paramName + " = " + $arguments + "[" + i + "];");
        }
        // Emit the body of the function.
        this.emitStmt(body);
    }
    Rewriter.prototype.getIdentifierReference = function (name) {
        var isNonlocal = this.nonlocalIdentifierNames.indexOf(name) !== -1;
        return isNonlocal ? name : '$.local.' + name;
    };
    Rewriter.prototype.reserveTemporaryIdentifier = function (name) {
        for (var i = 0, isNameAvailable = false; !isNameAvailable; ++i) {
            var fullName = name + (i || '');
            isNameAvailable = this.temporaryIdentifiersInUse.indexOf(fullName) === -1;
        }
        this.temporaryIdentifiersInUse.push(fullName);
        return '$.temp.' + fullName;
    };
    Rewriter.prototype.releaseTemporaryIdentifier = function (name) {
        var i = this.temporaryIdentifiersInUse.indexOf(name);
        this.temporaryIdentifiersInUse.splice(i, 1);
    };
    Rewriter.prototype.newLabel = function () {
        return '@' + ++this.nextLabel;
    };
    Rewriter.prototype.pushJumpTarget = function (type, value) {
        this.jumpTargets.push({ type: type, value: value });
        if (type === JumpTarget.Throw)
            this.currentThrowTarget = value;
    };
    Rewriter.prototype.popJumpTarget = function (count) {
        if (count === void 0) { count = 1; }
        while (--count >= 0) {
            var jumpTarget = this.jumpTargets.pop();
            if (jumpTarget.type === JumpTarget.Throw) {
                var label = _.findLast(this.jumpTargets, function (tgt) { return tgt.type === JumpTarget.Throw; }).value;
                this.currentThrowTarget = label;
            }
        }
    };
    Rewriter.prototype.emitCase = function (label) {
        var newCase = { type: 'SwitchCase', test: { type: 'Literal', value: label }, consequent: [] };
        this.switchCases.push(newCase);
    };
    Rewriter.prototype.emitText = function (text) {
        var stmt = this.generateAST(text);
        this.switchCases[this.switchCases.length - 1].consequent.push(stmt);
    };
    Rewriter.prototype.emitStmt = function (stmt) {
        rewriteStatement(stmt, this);
    };
    Rewriter.prototype.emitExpr = function (expr, $tgt) {
        rewriteExpression(expr, $tgt, this);
    };
    Rewriter.prototype.emitJump = function (type, value) {
        var i = _.findLastIndex(this.jumpTargets, function (tgt) { return tgt.type === type && (!value || tgt.value === value); });
        assert(i !== -1); // Should never happen
        var label = this.jumpTargets[i].value;
        var finalizers = this.jumpTargets.slice(i + 1).filter(function (tgt) { return tgt.type === JumpTarget.Finalize; }).map(function (tgt) { return tgt.value; });
        if (finalizers.length > 0) {
            this.emitText("$.finalizers.pending = ['" + finalizers.join("', '") + "'];");
            this.emitText("$.finalizers.afterward = '" + label + "';");
            this.emitText("$.pos = '@finalize';");
            this.emitText('continue;');
        }
        else {
            this.emitText("$.pos = '" + label + "';");
            this.emitText('continue;');
        }
    };
    Rewriter.prototype.generateAST = function (fromFragment) {
        var source = "\n            (function slowRoutineBody($) {\n                $.pos = $.pos || '@start';\n                $.local = $.local || {};\n                $.temp = $.temp || {};\n                $.error = $.error || { handler: '@fail' };\n                $.finalizers = $.finalizers || { pending: [] };\n                $.incoming = $.incoming || { type: 'yield' };\n                $.outgoing = $.outgoing || { type: 'return' };\n                while (true) {\n                    try {\n                        switch ($.pos) {\n                            case '@start':\n                                " + (fromFragment || '') + "\n                            case '@done':\n                                $.outgoing.type = 'return';\n                                return;\n                            case '@fail':\n                                $.outgoing.type = 'throw';\n                                $.outgoing.value = $.error.value;\n                                return;\n                            case '@finalize':\n                                $.pos = $.finalizers.pending.pop() || $.finalizers.afterward;\n                                continue;\n                        }\n                    }\n                    catch (ex) {\n                        $.error.occurred = true;\n                        $.error.value = ex;\n                        $.pos = $.error.handler;\n                        continue;\n                    }\n                }\n            })\n        ";
        var ast = esprima.parse(source);
        var funcExpr = ast.body[0]['expression'];
        var whileStmt = funcExpr.body['body'][7];
        var tryStmt = whileStmt.body['body'][0];
        var switchStmt = tryStmt.block['body'][0];
        if (fromFragment) {
            var stmts = switchStmt.cases[0].consequent;
            if (stmts.length === 1)
                return stmts[0];
            throw new Error('slowfunc: generateAST: fromFragment: expected a single statement');
        }
        else {
            (_a = switchStmt.cases).splice.apply(_a, [1, 0].concat(this.switchCases));
            return funcExpr;
        }
        var _a;
    };
    return Rewriter;
})();
// TODO: temp testing...
var JumpTarget;
(function (JumpTarget) {
    JumpTarget[JumpTarget["AfterTry"] = 0] = "AfterTry";
    JumpTarget[JumpTarget["Break"] = 1] = "Break";
    JumpTarget[JumpTarget["Continue"] = 2] = "Continue";
    JumpTarget[JumpTarget["Finalize"] = 3] = "Finalize";
    JumpTarget[JumpTarget["Return"] = 4] = "Return";
    JumpTarget[JumpTarget["Throw"] = 5] = "Throw";
})(JumpTarget || (JumpTarget = {}));
// TODO: temp testing...
function rewriteStatement(stmt, emitter) {
    match(stmt, {
        EmptyStatement: function (stmt) { },
        BlockStatement: function (stmt) {
            stmt.body.forEach(function (stmt) { return emitter.emitStmt(stmt); });
        },
        ExpressionStatement: function (stmt) {
            var $void = emitter.reserveTemporaryIdentifier('void');
            emitter.emitExpr(stmt.expression, $void);
            emitter.releaseTemporaryIdentifier($void);
        },
        IfStatement: function (stmt) {
            var conLabel = emitter.newLabel();
            var altLabel = emitter.newLabel();
            var exitLabel = emitter.newLabel();
            var $test = emitter.reserveTemporaryIdentifier('test');
            emitter.emitExpr(stmt.test, $test);
            emitter.emitText("$.pos = " + $test + " ? '" + conLabel + "' : '" + altLabel + "';");
            emitter.releaseTemporaryIdentifier($test);
            emitter.emitText("continue;");
            emitter.emitCase(conLabel);
            emitter.emitStmt(stmt.consequent);
            emitter.emitText("$.pos = '" + exitLabel + "';");
            emitter.emitText("continue;");
            emitter.emitCase(altLabel);
            if (stmt.alternate)
                emitter.emitStmt(stmt.alternate);
            emitter.emitCase(exitLabel);
        },
        SwitchStatement: function (stmt) {
            var exitLabel = emitter.newLabel();
            emitter.pushJumpTarget(JumpTarget.Break, exitLabel);
            var $discriminant = emitter.reserveTemporaryIdentifier('discriminant');
            var $test = emitter.reserveTemporaryIdentifier('test');
            emitter.emitExpr(stmt.discriminant, $discriminant);
            stmt.cases.forEach(function (switchCase) {
                var matchLabel = emitter.newLabel();
                var skipLabel = emitter.newLabel();
                if (switchCase.test) {
                    emitter.emitExpr(switchCase.test, $test);
                    emitter.emitText("$.pos = " + $discriminant + " === " + $test + " ? '" + matchLabel + "' : '" + skipLabel + "'");
                    emitter.emitText('continue;');
                }
                emitter.emitCase(matchLabel);
                switchCase.consequent.forEach(function (stmt) { return emitter.emitStmt(stmt); });
                emitter.emitCase(skipLabel);
            });
            emitter.emitCase(exitLabel);
            emitter.releaseTemporaryIdentifier($discriminant);
            emitter.releaseTemporaryIdentifier($test);
            emitter.popJumpTarget();
        },
        WhileStatement: function (stmt) {
            var entryLabel = emitter.newLabel();
            var iterLabel = emitter.newLabel();
            var exitLabel = emitter.newLabel();
            emitter.pushJumpTarget(JumpTarget.Break, exitLabel);
            emitter.pushJumpTarget(JumpTarget.Continue, entryLabel);
            emitter.emitCase(entryLabel);
            var $test = emitter.reserveTemporaryIdentifier('test');
            emitter.emitExpr(stmt.test, $test);
            emitter.emitText("$.pos = " + $test + " ? '" + iterLabel + "' : '" + exitLabel + "';");
            emitter.releaseTemporaryIdentifier($test);
            emitter.emitText("continue;");
            emitter.emitCase(iterLabel);
            emitter.emitStmt(stmt.body);
            emitter.emitText("$.pos = '" + entryLabel + "';");
            emitter.emitText("continue;");
            emitter.emitCase(exitLabel);
            emitter.popJumpTarget(2);
        },
        DoWhileStatement: function (stmt) {
            var entryLabel = emitter.newLabel();
            var iterLabel = emitter.newLabel();
            var exitLabel = emitter.newLabel();
            emitter.pushJumpTarget(JumpTarget.Break, exitLabel);
            emitter.pushJumpTarget(JumpTarget.Continue, entryLabel);
            emitter.emitCase(entryLabel);
            emitter.emitStmt(stmt.body);
            var $test = emitter.reserveTemporaryIdentifier('test');
            emitter.emitExpr(stmt.test, $test);
            emitter.emitText("$.pos = " + $test + " ? '" + entryLabel + "' : '" + exitLabel + "';");
            emitter.releaseTemporaryIdentifier($test);
            emitter.emitText("continue;");
            emitter.emitCase(exitLabel);
            emitter.popJumpTarget(2);
        },
        ForStatement: function (stmt) {
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
                emitter.emitText("$.pos = " + $test + " ? '" + iterLabel + "' : '" + exitLabel + "';");
                emitter.releaseTemporaryIdentifier($test);
                emitter.emitText("continue;");
            }
            emitter.emitCase(iterLabel);
            emitter.emitStmt(stmt.body);
            if (stmt.update) {
                var $void = emitter.reserveTemporaryIdentifier('void');
                emitter.emitExpr(stmt.update, $void);
                emitter.releaseTemporaryIdentifier($void);
            }
            emitter.emitText("$.pos = '" + entryLabel + "';");
            emitter.emitText("continue;");
            emitter.emitCase(exitLabel);
            emitter.popJumpTarget(2);
        },
        ForInStatement: function (stmt) {
            var loopVar = stmt.left.type === 'VariableDeclaration' ? stmt.left['declarations'][0].id : stmt.left;
            if (loopVar.type !== 'Identifier')
                throw new Error("slowfunc: unsupported for..in loop variable type: '" + loopVar.type + "'");
            if (stmt.left.type === 'VariableDeclaration') {
                if (stmt.left['declarations'][0].init)
                    throw new Error("slowfunc: for..in loop variable initialiser is not supported.");
            }
            var $name = loopVar.name;
            var $obj = emitter.reserveTemporaryIdentifier('obj');
            var $props = emitter.reserveTemporaryIdentifier('props');
            var $i = emitter.reserveTemporaryIdentifier('i');
            emitter.emitExpr(stmt.right, $obj);
            var $o = emitter.reserveTemporaryIdentifier('o');
            emitter.emitText("for (" + $o + " = " + $obj + ", " + $props + " = []; " + $o + "; " + $props + " = " + $props + ".concat(Object.keys(" + $o + ")), " + $o + " = " + $o + ".prototype) ;");
            emitter.releaseTemporaryIdentifier('$o');
            var forStmt = esprima.parse("for (" + $i + " = 0; " + $i + " < " + $props + ".length; ++" + $i + ") { " + $name + " = " + $props + "[" + $i + "]; }").body[0];
            var forBody = forStmt.body;
            forBody.body = forBody.body.concat(stmt.body.type === 'BlockStatement' ? stmt.body['body'] : stmt.body);
            emitter.emitStmt(forStmt);
            emitter.releaseTemporaryIdentifier('$obj');
            emitter.releaseTemporaryIdentifier('$props');
            emitter.releaseTemporaryIdentifier('$i');
        },
        TryStatement: function (stmt) {
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
            emitter.emitText("$.error.handler = '" + emitter.currentThrowTarget + "';");
            emitter.emitText("$.error.occurred = false;");
            emitter.emitStmt(stmt.block);
            emitter.emitCase(catchLabel);
            emitter.popJumpTarget(); // Throw
            emitter.emitText("$.error.handler = '" + emitter.currentThrowTarget + "';");
            emitter.emitText("$.pos = $.error.occurred ? '" + conLabel + "' : '" + altLabel + "';");
            emitter.emitText('continue;');
            emitter.emitCase(conLabel);
            if (stmt.handler) {
                if (stmt.handler.param.type !== 'Identifier')
                    throw new Error("slowfunc: catch parameter must be an identifier");
                var $ex = emitter.getIdentifierReference(stmt.handler.param['name']);
                emitter.emitText($ex + " = $.error.value;");
                emitter.emitStmt(stmt.handler.body);
            }
            else {
                emitter.emitText("throw $.error.value;");
            }
            emitter.emitCase(altLabel);
            emitter.emitJump(JumpTarget.AfterTry);
            // finally sub-block
            emitter.emitCase(finallyLabel);
            emitter.emitText("$.error.handler = '" + emitter.currentThrowTarget + "';");
            if (stmt.finalizer)
                emitter.emitStmt(stmt.finalizer);
            emitter.emitText("$.pos = '@finalize';");
            emitter.emitText('continue');
            // block exit
            emitter.emitCase(exitLabel);
            emitter.popJumpTarget(2); // AfterTry & Finalize
        },
        LabeledStatement: function (stmt) {
            var entryLabel = '@' + stmt.label.name + '-entry';
            var exitLabel = '@' + stmt.label.name + '-exit';
            emitter.pushJumpTarget(JumpTarget.Break, exitLabel);
            emitter.pushJumpTarget(JumpTarget.Continue, entryLabel);
            emitter.emitCase(entryLabel);
            emitter.emitStmt(stmt.body);
            emitter.emitCase(exitLabel);
            emitter.popJumpTarget(2);
        },
        BreakStatement: function (stmt) {
            if (stmt.label)
                var label = '@' + stmt.label.name + '-exit';
            emitter.emitJump(JumpTarget.Break, label);
        },
        ContinueStatement: function (stmt) {
            if (stmt.label)
                var label = '@' + stmt.label.name + '-entry';
            emitter.emitJump(JumpTarget.Continue, label);
        },
        ReturnStatement: function (stmt) {
            if (stmt.argument) {
                emitter.emitExpr(stmt.argument, '$.outgoing.value');
            }
            else {
                emitter.emitText("$.outgoing.value = void 0;");
            }
            emitter.emitJump(JumpTarget.Return);
        },
        ThrowStatement: function (stmt) {
            var $arg = emitter.reserveTemporaryIdentifier('arg');
            emitter.emitExpr(stmt.argument, $arg);
            emitter.emitText("throw " + $arg + ";");
            emitter.releaseTemporaryIdentifier($arg);
        },
        VariableDeclaration: function (stmt) {
            stmt.declarations.forEach(function (decl) {
                if (decl.id.type !== 'Identifier')
                    throw new Error("slowfunc: unsupported declarator ID type: '" + decl.id.type + "'");
                var $name = emitter.getIdentifierReference(decl.id['name']);
                if (decl.init)
                    emitter.emitExpr(decl.init, $name);
            });
        },
        Otherwise: function (stmt) {
            throw new Error("slowfunc: unsupported statement type: '" + stmt.type + "'");
        }
    });
}
// TODO: temp testing...
function rewriteExpression(expr, $tgt, emitter) {
    match(expr, {
        SequenceExpression: function (expr) {
            expr.expressions.forEach(function (expr) {
                emitter.emitExpr(expr, $tgt);
            });
        },
        YieldExpression: function (expr) {
            var resumeLabel = emitter.newLabel();
            var yieldLabel = emitter.newLabel();
            var throwLabel = emitter.newLabel();
            var returnLabel = emitter.newLabel();
            emitter.emitText("$.outgoing.type = 'yield';");
            if (expr.argument) {
                emitter.emitExpr(expr.argument, '$.outgoing.value');
            }
            else {
                emitter.emitText("$.outgoing.value = void 0;");
            }
            emitter.emitText("$.pos = '" + resumeLabel + "';");
            emitter.emitText('return;');
            emitter.emitCase(resumeLabel);
            emitter.emitText("$.pos = { yield: '" + yieldLabel + "', throw: '" + throwLabel + "', return: '" + returnLabel + "' }[$.incoming.type];");
            emitter.emitText('continue;');
            emitter.emitCase(throwLabel);
            emitter.emitText("throw $.incoming.value;");
            emitter.emitCase(returnLabel);
            emitter.emitText("$.outgoing.value = $.incoming.value;");
            emitter.emitJump(JumpTarget.Return);
            emitter.emitCase(yieldLabel);
            emitter.emitText($tgt + " = $.incoming.value;");
        },
        AssignmentExpression: function (expr) {
            // NB: order of evaluation for 'a[b] += c' is: a then b then c 
            var $rhs = emitter.reserveTemporaryIdentifier('rhs');
            var $obj = emitter.reserveTemporaryIdentifier('obj');
            var $key = emitter.reserveTemporaryIdentifier('key');
            if (expr.left.type === 'Identifier') {
                var lhsText = emitter.getIdentifierReference(expr.left['name']);
            }
            else if (expr.left.type === 'MemberExpression') {
                var left = expr.left;
                emitter.emitExpr(left.object, $obj);
                if (left.computed) {
                    emitter.emitExpr(left.property, $key);
                }
                else {
                    emitter.emitText($key + " = '" + left.property['name'] + "';");
                }
                var lhsText = $obj + "[" + $key + "]";
            }
            else {
                throw new Error("slowfunc: unsupported l-value type: '" + expr.left.type + "'");
            }
            emitter.emitExpr(expr.right, $rhs);
            emitter.emitText($tgt + " = " + lhsText + " " + expr.operator + " " + $rhs + ";");
            emitter.releaseTemporaryIdentifier($rhs);
            emitter.releaseTemporaryIdentifier($obj);
            emitter.releaseTemporaryIdentifier($key);
        },
        ConditionalExpression: function (expr) {
            var conLabel = emitter.newLabel();
            var altLabel = emitter.newLabel();
            var exitLabel = emitter.newLabel();
            var $test = emitter.reserveTemporaryIdentifier('test');
            emitter.emitExpr(expr.test, $test);
            emitter.emitText("$.pos = " + $test + " ? '" + conLabel + "' : '" + altLabel + "';");
            emitter.releaseTemporaryIdentifier($test);
            emitter.emitText("continue;");
            emitter.emitCase(conLabel);
            emitter.emitExpr(expr.consequent, $tgt);
            emitter.emitText("$.pos = '" + exitLabel + "';");
            emitter.emitText("continue;");
            emitter.emitCase(altLabel);
            emitter.emitExpr(expr.alternate, $tgt);
            emitter.emitCase(exitLabel);
        },
        LogicalExpression: function (expr) {
            var rhsLabel = emitter.newLabel();
            var exitLabel = emitter.newLabel();
            emitter.emitExpr(expr.left, $tgt);
            emitter.emitText("$.pos = " + (expr.operator === '&&' ? '' : '!') + $tgt + " ? '" + rhsLabel + "' : '" + exitLabel + "';");
            emitter.emitText('continue;');
            emitter.emitCase(rhsLabel);
            emitter.emitExpr(expr.right, $tgt);
            emitter.emitCase(exitLabel);
        },
        BinaryExpression: function (expr) {
            var $lhs = emitter.reserveTemporaryIdentifier('lhs');
            var $rhs = emitter.reserveTemporaryIdentifier('rhs');
            emitter.emitExpr(expr.left, $lhs);
            emitter.emitExpr(expr.right, $rhs);
            emitter.emitText($tgt + " = " + $lhs + " " + expr.operator + " " + $rhs + ";");
            emitter.releaseTemporaryIdentifier($lhs);
            emitter.releaseTemporaryIdentifier($rhs);
        },
        UnaryExpression: function (expr) {
            emitter.emitExpr(expr.argument, $tgt);
            emitter.emitText($tgt + " = " + (expr.prefix ? expr.operator : '') + " " + $tgt + " " + (expr.prefix ? '' : expr.operator) + ";");
        },
        UpdateExpression: function (expr) {
            var $obj = emitter.reserveTemporaryIdentifier('obj');
            var $key = emitter.reserveTemporaryIdentifier('key');
            if (expr.argument.type === 'Identifier') {
                var argText = emitter.getIdentifierReference(expr.argument['name']);
            }
            else if (expr.argument.type === 'MemberExpression') {
                var arg = expr.argument;
                emitter.emitExpr(arg.object, $obj);
                if (arg.computed) {
                    emitter.emitExpr(arg.property, $key);
                }
                else {
                    emitter.emitText($key + " = '" + arg.property['name'] + "';");
                }
                var argText = $obj + "[" + $key + "]";
            }
            else {
                throw new Error("slowfunc: unsupported l-value type: '" + expr.argument.type);
            }
            var pre = expr.prefix ? expr.operator : '';
            var post = expr.prefix ? '' : expr.operator;
            emitter.emitText($tgt + " = " + pre + argText + post + ";");
            emitter.releaseTemporaryIdentifier($obj);
            emitter.releaseTemporaryIdentifier($key);
        },
        CallExpression: function (expr) {
            var $receiver = emitter.reserveTemporaryIdentifier('receiver');
            var $func = emitter.reserveTemporaryIdentifier('func');
            var $args = emitter.reserveTemporaryIdentifier('args');
            var $arg = emitter.reserveTemporaryIdentifier('arg');
            if (expr.callee.type === 'MemberExpression') {
                var callee = expr.callee;
                emitter.emitExpr(callee.object, $receiver);
                if (callee.computed) {
                    emitter.emitExpr(callee.property, $func);
                    emitter.emitText($func + " = " + $receiver + "[" + $func + "];");
                }
                else {
                    emitter.emitText($func + " = " + $receiver + "['" + callee.property['name'] + "'];");
                }
            }
            else {
                emitter.emitText($receiver + " = null;");
                emitter.emitExpr(expr.callee, $func);
            }
            emitter.emitText($args + " = [];");
            for (var i = 0; i < expr.arguments.length; ++i) {
                emitter.emitExpr(expr.arguments[i], $arg);
                emitter.emitText($args + ".push(" + $arg + ");");
            }
            emitter.emitText($tgt + " = " + $func + ".apply(" + $receiver + ", " + $args + ");");
            emitter.releaseTemporaryIdentifier($receiver);
            emitter.releaseTemporaryIdentifier($func);
            emitter.releaseTemporaryIdentifier($args);
            emitter.releaseTemporaryIdentifier($arg);
        },
        NewExpression: function (expr) {
            var $func = emitter.reserveTemporaryIdentifier('func');
            var $args = emitter.reserveTemporaryIdentifier('args');
            var $arg = emitter.reserveTemporaryIdentifier('arg');
            emitter.emitExpr(expr.callee, $func);
            emitter.emitText($args + " = [];");
            for (var i = 0; i < expr.arguments.length; ++i) {
                emitter.emitExpr(expr.arguments[i], $arg);
                emitter.emitText($args + ".push(" + $arg + ");");
            }
            emitter.emitText($tgt + " = Object.create(" + $func + ".prototype);");
            emitter.emitText($tgt + " = " + $func + ".apply(" + $tgt + ", " + $args + ") || " + $tgt + ";");
            emitter.releaseTemporaryIdentifier($func);
            emitter.releaseTemporaryIdentifier($args);
            emitter.releaseTemporaryIdentifier($arg);
        },
        MemberExpression: function (expr) {
            var $obj = emitter.reserveTemporaryIdentifier('obj');
            emitter.emitExpr(expr.object, $obj);
            if (expr.computed) {
                var $key = emitter.reserveTemporaryIdentifier('key');
                emitter.emitExpr(expr.property, $key);
                emitter.emitText($tgt + " = " + $obj + "[" + $key + "];");
                emitter.releaseTemporaryIdentifier($key);
            }
            else {
                emitter.emitText($tgt + " = " + $obj + "['" + expr.property['name'] + "'];");
            }
            emitter.releaseTemporaryIdentifier($obj);
        },
        ArrayExpression: function (expr) {
            var $elem = emitter.reserveTemporaryIdentifier('elem');
            emitter.emitText($tgt + " = [];");
            for (var i = 0; i < expr.elements.length; ++i) {
                emitter.emitExpr(expr.elements[i], $elem);
                emitter.emitText($tgt + ".push(" + $elem + ");");
            }
            emitter.releaseTemporaryIdentifier($elem);
        },
        ObjectExpression: function (expr) {
            var $key = emitter.reserveTemporaryIdentifier('key');
            emitter.emitText($tgt + " = {};");
            for (var i = 0; i < expr.properties.length; ++i) {
                var prop = expr.properties[i];
                if (prop.key.type === 'Identifier') {
                    emitter.emitText($key + " = '" + prop.key['name'] + "';");
                }
                else {
                    emitter.emitExpr(prop.key, $key);
                }
                emitter.emitExpr(prop.value, $tgt + "[" + $key + "]");
            }
            emitter.releaseTemporaryIdentifier($key);
        },
        Identifier: function (expr) {
            var $name = emitter.getIdentifierReference(expr.name);
            return emitter.emitText($tgt + " = " + $name + ";");
        },
        TemplateLiteral: function (expr) {
            var $expr = emitter.reserveTemporaryIdentifier('expr');
            emitter.emitText($tgt + " = '';");
            for (var i = 0; i < expr.expressions.length; ++i) {
                emitter.emitText($tgt + " += " + JSON.stringify(expr.quasis[i].value.cooked) + ";");
                emitter.emitExpr(expr.expressions[i], $expr);
                emitter.emitText($tgt + " += " + $expr + ";");
            }
            emitter.emitText($tgt + " += " + JSON.stringify(expr.quasis[i].value.cooked) + ";");
            emitter.releaseTemporaryIdentifier($expr);
        },
        Literal: function (expr) {
            if (expr['regex']) {
                emitter.emitText($tgt + " = /" + expr['regex'].pattern + "/" + expr['regex'].flags);
            }
            else {
                emitter.emitText($tgt + " = " + JSON.stringify(expr.value) + ";");
            }
        },
        Otherwise: function (expr) {
            throw new Error("slowfunc: unsupported expression type: '" + expr.type + "'");
        }
    });
}
//# sourceMappingURL=bodyRewriter.js.map