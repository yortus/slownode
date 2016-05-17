'use strict';
import * as assert from 'assert';
import {Node, File, Program} from "babel-types";                            // Elided (used only for types)
import {Statement, Expression, Identifier} from "babel-types";              // Elided (used only for types)
import {StringLiteral, NumericLiteral, SpreadElement} from "babel-types";   // Elided (used only for types)
import {types as t} from './babel';
import matchNode from './match-node';
import {Register} from './vm';
import Task from './task';
import TaskBuilder from './task-builder';





// TODO: ...
export function emit(code: string, ast: Node): Task {
    let tb = new TaskBuilder(code);
    assert(t.isFile(ast));
    visitStatement(tb, (<File> ast).program);
    let newSrc = tb.build();
    let result = newSrc;
    return <any> result; // TODO: !!! not a task !!!
}





// TODO: ...
function visitStatement(tb: TaskBuilder, stmt: Statement|Program) {

    // TODO: ...
    let visitStmt = (stmt: Statement) => visitStatement(tb, stmt);
    let visitExpr = (expr: Expression|SpreadElement, $T: Register) => visitExpression(tb, expr, $T);

    // TODO: ...
    let oldLoc = tb.sourceLocation;
    tb.sourceLocation = stmt.loc;

    // TODO: ...
    if (stmt.scope) {
        tb.enterScope(stmt.scope);
    }
    
    // TODO: ...
    matchNode<void>(stmt, {
        // ------------------------- core -------------------------
        BlockStatement:         stmt => {
                                    stmt.body.forEach(visitStmt);
                                },
        // BreakStatement:      stmt => [***],
        // CatchClause:         stmt => [***],
        // ContinueStatement:   stmt => [***],
        // DebuggerStatement:   stmt => [***],
        // DoWhileStatement:    stmt => [***],
        // Statement:           stmt => [***],
        EmptyStatement:         stmt => {},
        ExpressionStatement:    stmt => {
                                    tb.withRegisters($0 => {
                                        visitExpr(stmt.expression, $0);
                                    });
                                },
        Program:                stmt => {
                                    stmt.body.forEach(visitStmt);
                                },
        // ForInStatement:      stmt => [***],
        VariableDeclaration:    stmt => {
                                    // TODO: handle initialisers (if present)...
                                    // nothing else to do...
                                    // TODO: initial cut... check code below... complete? correct?
                                    stmt.declarations.forEach(decl => {
                                        if (!decl.init) return;
                                        tb.withRegisters(($0) => {
                                            visitExpr(decl.init, $0);
                                            if (t.isIdentifier(decl.id)) {
                                                tb.STORE(tb.ENV, decl.id.name, $0);
                                            }
                                            else {
                                                throw new Error(`Unsupported variable declarator type: '${decl.id.type}'`);
                                            }
                                        });
                                    });
                                },
        // ForStatement:        stmt => [***],
        // FunctionDeclaration: stmt => [***],
        IfStatement:            stmt => {
                                    let L1 = tb.newLabel();
                                    let L2 = tb.newLabel();
                                    tb.withRegisters($0 => {
                                        visitExpr(stmt.test, $0);
                                        tb.BF(L1, $0);
                                    });
                                    visitStmt(stmt.consequent);
                                    if (stmt.alternate) tb.B(L2);
                                    L1.resolve();
                                    visitStmt(stmt.alternate || t.blockStatement([]));
                                    L2.resolve();
                                },
        // LabeledStatement:    stmt => [***],
        // ReturnStatement:     stmt => [***],
        // SwitchCase:          stmt => [***],
        // SwitchStatement:     stmt => [***],
        // ThrowStatement:      stmt => [***],
        // TryStatement:        stmt => [***],
        // VariableDeclarator:  stmt => [***],
        // WhileStatement:      stmt => [***],
        // WithStatement:       stmt => [***],

        // ------------------------- es2015 -------------------------
        // ClassBody:           stmt => [***],
        // ClassDeclaration:    stmt => [***],
        // ExportAllDeclaration: stmt => [***],
        // ExportDefaultDeclaration: stmt => [***],
        // ExportNamedDeclaration: stmt => [***],
        // Declaration:         stmt => [***],
        // ExportSpecifier:     stmt => [***],
        // ForOfStatement:      stmt => [***],
        // ImportDeclaration:   stmt => [***],
        // ImportDefaultSpecifier: stmt => [***],
        // ImportNamespaceSpecifier: stmt => [***],
        // ImportSpecifier:     stmt => [***],
        // ClassMethod:         stmt => [***],

        // ------------------------- experimental -------------------------
        // Decorator:           stmt => [***],
        // ExportDefaultSpecifier: stmt => [***],
        // ExportNamespaceSpecifier: stmt => [***]
    });

    // TODO: temp testing...
    if (stmt.scope) {
        tb.leaveScope();
    }

    // TODO: temp testing...
    tb.sourceLocation = oldLoc;
}





function visitExpression(tb: TaskBuilder, expr: Expression|SpreadElement, $T: Register) {

    // TODO: ...
    let visitExpr = (expr: Expression|SpreadElement, $T: Register) => visitExpression(tb, expr, $T);

    // TODO: ...
    let oldLoc = tb.sourceLocation;
    tb.sourceLocation = expr.loc;

    // TODO: ...
    matchNode<void>(expr, {
        // ------------------------- core -------------------------
        ArrayExpression:        expr => {
                                    tb.NEWARR($T);
                                    tb.withRegisters($0 => {
                                        expr.elements.forEach((el, i) => {
                                            visitExpr(el, $0);
                                            tb.STORE($T, i, $0);
                                        });
                                    });
                                },
        AssignmentExpression:   expr => {
                                    // ES6 destructuring introduces a number of new LValue node types.
                                    // We don't need to handle these here, since we can have these nodes
                                    // downlevelled to ES5 equivalents prior to this traversal of the AST.
                                    if (!t.isIdentifier(expr.left) && !t.isMemberExpression(expr.left)) {
                                        throw new Error(`Unsupported LValue type: '${expr.left.type}'`);
                                    }

                                    // Handle simple assignment
                                    if (expr.operator === '=') {
                                        visitExpr(expr.right, $T);
                                        if (t.isIdentifier(expr.left)) {
                                            tb.STORE(tb.ENV, expr.left.name, $T);
                                        }
                                        else {
                                            let left = expr.left;
                                            tb.withRegisters(($0, $1) => {
                                                visitExpr(left.object, $0);
                                                visitExpr(left.property, $1);
                                                tb.STORE($0, $1, $T);
                                            });
                                        }
                                    }

                                    // Handle compound assignment + operation
                                    else {
                                        let operation = (operator: string, $T: Register, $0: Register) => {
                                            switch (operator) {
                                                case '+=': return tb.ADD($T, $0, $T);
                                                case '-=': return tb.SUB($T, $0, $T);
                                                case '*=': return tb.MUL($T, $0, $T);
                                                case '/=': return tb.DIV($T, $0, $T);
                                                // TODO: "%=" | "<<=" | ">>=" | ">>>=" | "|=" | "^=" | "&=";
                                                default: throw new Error(`Unsupported assignment operator: '${expr.operator}'`);
                                            }
                                        }
                                        if (t.isIdentifier(expr.left)) {
                                            let left = expr.left;
                                            tb.withRegisters($0 => {
                                                tb.LOAD($0, tb.ENV, left.name);
                                                visitExpr(expr.right, $T);
                                                operation(expr.operator, $T, $0);
                                            });
                                            tb.STORE(tb.ENV, left.name, $T);
                                        }
                                        else {
                                            let left = expr.left;
                                            tb.withRegisters(($0, $1, $2) => {
                                                visitExpr(left.object, $1);
                                                visitExpr(left.property, $2);
                                                tb.LOAD($0, $1, $2);
                                                visitExpr(expr.right, $T);
                                                operation(expr.operator, $T, $0);
                                                tb.STORE($1, $2, $T);
                                            });
                                        }
                                    }
                                },
        BinaryExpression:       expr => {
                                    visitExpr(expr.left, $T);
                                    tb.withRegisters($0 => {
                                        visitExpr(expr.right, $0);
                                        switch (expr.operator) {
                                            case '+':   return tb.ADD($T, $T, $0);
                                            case '-':   return tb.SUB($T, $T, $0);
                                            case '*':   return tb.MUL($T, $T, $0);
                                            case '/':   return tb.DIV($T, $T, $0);
                                            case '===': return tb.EQ($T, $T, $0);
                                            case '!==': return tb.NE($T, $T, $0);
                                            case '>=':  return tb.GE($T, $T, $0);
                                            case '>':   return tb.GT($T, $T, $0);
                                            case '<=':  return tb.LE($T, $T, $0);
                                            case '<':   return tb.LT($T, $T, $0);
                                            // TODO: "%" | "**" | "&" | "|" | ">>" | ">>>" | "<<" | "^" | "==" | "!=" | "in" | "instanceof";
                                            default: throw new Error(`Unsupported binary operator: '${expr.operator}'`);
                                        }
                                    });
                                },
        Identifier:             expr => {
                                    tb.LOAD($T, tb.ENV, expr.name);
                                },
        CallExpression:         expr => {
                                    if (t.isIdentifier(expr.callee)) {
                                        let callee = expr.callee;
                                        tb.withRegisters(($0, $1) => {
                                            tb.LOAD($T, tb.ENV, callee.name);
                                            tb.NEWARR($0);
                                            expr.arguments.forEach((arg, i) => {
                                                visitExpr(arg, $1);
                                                tb.STORE($0, i, $1);
                                            });
                                            tb.LOADC($1, null); // TODO: set 'this' - should be what? global object? undefined?
                                            tb.CALL($T, $T, $1, $0);
                                        });
                                    }
                                    else {
                                        // TODO: MemberExpression, others? Need to set `this` if callee is a member expression...
                                        throw new Error(`Unsupported callee type: '${expr.callee.type}'`);
                                    }
                                },
        ConditionalExpression:  expr => {
                                    let L1 = tb.newLabel();
                                    let L2 = tb.newLabel();
                                    visitExpr(expr.test, $T);
                                    tb.BF(L1, $T);
                                    visitExpr(expr.consequent, $T);
                                    tb.B(L2);
                                    L1.resolve();
                                    visitExpr(expr.alternate, $T);
                                    L2.resolve();
                                },
        // FunctionExpression:  expr => [***],
        StringLiteral:          expr => {
                                    tb.LOADC($T, expr.value);
                                },
        NumericLiteral:         expr => {
                                    tb.LOADC($T, expr.value);
                                },
        NullLiteral:            expr => {
                                    tb.LOADC($T, null);
                                },
        BooleanLiteral:         expr => {
                                    tb.LOADC($T, expr.value);
                                },
        // RegExpLiteral:          expr => [***],
        LogicalExpression:      expr => {
                                    let L1 = tb.newLabel();
                                    visitExpr(expr.left, $T);
                                    expr.operator === '&&' ? tb.BF(L1, $T) : tb.BT(L1, $T);
                                    visitExpr(expr.right, $T);
                                    L1.resolve();
                                },
        MemberExpression:       expr => {
                                    // TODO: refactor common code out of the following cases...
                                    if (!expr.computed) {
                                        // TODO: good example for TS assert(type) suggestion...
                                        assert(t.isIdentifier(expr.property));
                                        tb.withRegisters($0 => {
                                            visitExpr(expr.object, $0);
                                            tb.LOAD($T, $0, (<Identifier> expr.property).name);
                                        });
                                    }
                                    else if (t.isStringLiteral(expr.property) || t.isNumericLiteral(expr.property)) {
                                        let prop = expr.property;
                                        tb.withRegisters($0 => {
                                            visitExpr(expr.object, $0);
                                            tb.LOAD($T, $0, prop.value);
                                        });
                                    }
                                    else {
                                        tb.withRegisters(($0, $1) => {
                                            visitExpr(expr.object, $0);
                                            visitExpr(expr.property, $1);
                                            tb.LOAD($T, $0, $1);
                                        });
                                    }
                                },
        // NewExpression:       expr => [***],
        ObjectExpression:       expr => {
                                    tb.NEWOBJ($T);
                                    expr.properties.forEach(property => {
                                        if (t.isObjectProperty(property)) {
                                            let prop = property;
                                            if (!prop.computed) {
                                                let key: string|number;
                                                switch (prop.key.type) {
                                                    case 'Identifier':      key = (<Identifier> prop.key).name; break;
                                                    case 'StringLiteral':   key = (<StringLiteral> prop.key).value; break;
                                                    case 'NumericLiteral':  key = (<NumericLiteral> prop.key).value; break;
                                                    default: throw new Error(`Unsupported property key: '${prop.key.type}'`);
                                                }
                                                tb.withRegisters($0 => {
                                                    visitExpr(prop.value, $0);
                                                    tb.STORE($T, key, $0);
                                                });
                                            }
                                            else {
                                                tb.withRegisters(($0, $1) => {
                                                    visitExpr(prop.key, $0);
                                                    visitExpr(prop.value, $1);
                                                    tb.STORE($T, $0, $1);
                                                });
                                            }
                                        }
                                        else {
                                            // TODO: ObjectMethod (ES6), SpreadProperty (experimental)
                                            throw new Error(`Unsupported object property: '${property.type}'`);
                                        }
                                    });
                                },
        SequenceExpression:     expr => {
                                    expr.expressions.forEach(expr => {
                                        visitExpr(expr, $T);
                                    });
                                },
        // ThisExpression:      expr => [***],
        UnaryExpression:        expr => {
                                    visitExpr(expr.argument, $T);
                                    switch (expr.operator) {
                                        case '-':   return tb.NEG($T, $T);
                                        case '!':   return tb.NOT($T, $T);
                                        // TODO: "+" | "~" | "typeof" | "void" | "delete"
                                        default: throw new Error(`Unsupported unary operator: '${expr.operator}'`);
                                    }
                                },
        // UpdateExpression:    expr => [***],

        // ------------------------- es2015 -------------------------
        // ArrowFunctionExpression: expr => [***],
        // ClassBody:           expr => [***],
        // ClassExpression:     expr => [***],
        // ClassMethod:         expr => [***],
        // SpreadElement:       expr => [***],
        // Super:               expr => [***],
        // TaggedTemplateExpression: expr => [***],
        // TemplateLiteral:     expr => [***],
        // TemplateElement:     expr => [***],
        // YieldExpression:     expr => [***],

        // ------------------------- experimental -------------------------
        // AwaitExpression:     expr => [***]
    });
    tb.sourceLocation = oldLoc;
}
