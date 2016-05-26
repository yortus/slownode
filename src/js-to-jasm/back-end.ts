'use strict';
import * as assert from 'assert';
import {Node, File, Program as ProgramNode} from "babel-types";             // Elided (used only for types)
import {Statement, Expression, Identifier} from "babel-types";              // Elided (used only for types)
import {StringLiteral, NumericLiteral, SpreadElement} from "babel-types";   // Elided (used only for types)
import {types as t} from './babel';
import matchNode from './match-node';
import Register from '../jasm/register';
import ObjectCode from '../jasm/object-code';
import Emitter from '../jasm/emitter';





// TODO: ...
export function emit(javaScriptSource: string, ast: Node): ObjectCode {
    let jasm = new Emitter(javaScriptSource);
    assert(t.isFile(ast));
    visitStatement(jasm, (<File> ast).program);
    let newSrc = jasm.build();
    let result = newSrc;
    return result;
}





// TODO: ...
function visitStatement(jasm: Emitter, stmt: Statement|ProgramNode) {

    // TODO: ...
    let visitStmt = (stmt: Statement) => visitStatement(jasm, stmt);
    let visitExpr = (expr: Expression|SpreadElement, $T: Register) => visitExpression(jasm, expr, $T);

    // TODO: ...
    let oldLoc = jasm.sourceLocation;
    jasm.sourceLocation = stmt.loc;

    // TODO: ...
    if (stmt.scope) {
        jasm.enterScope(stmt.scope);
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
                                    jasm.withRegisters($0 => {
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
                                        jasm.withRegisters(($0) => {
                                            visitExpr(decl.init, $0);
                                            if (t.isIdentifier(decl.id)) {
                                                jasm.STORE(jasm.ENV, decl.id.name, $0);
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
                                    let L1 = jasm.newLabel();
                                    let L2 = jasm.newLabel();
                                    jasm.withRegisters($0 => {
                                        visitExpr(stmt.test, $0);
                                        jasm.BF(L1, $0);
                                    });
                                    visitStmt(stmt.consequent);
                                    if (stmt.alternate) jasm.B(L2);
                                    L1.resolve();
                                    visitStmt(stmt.alternate || t.blockStatement([]));
                                    L2.resolve();
                                },
        // LabeledStatement:    stmt => [***],
        // ReturnStatement:     stmt => [***],
        // SwitchCase:          stmt => [***],
        // SwitchStatement:     stmt => [***],
        ThrowStatement:         stmt => {
                                    jasm.withRegisters($0 => {
                                        visitExpr(stmt.argument, $0);
                                        jasm.THROW($0);
                                    });
                                },
        // TryStatement:        stmt => [***],
        // VariableDeclarator:  stmt => [***],
        WhileStatement:         stmt => {
                                    let L1 = jasm.newLabel();
                                    let L2 = jasm.newLabel();
                                    L1.resolve();
                                    jasm.withRegisters($0 => {
                                        visitExpr(stmt.test, $0);
                                        jasm.BF(L2, $0);
                                    });
                                    visitStmt(stmt.body);
                                    jasm.B(L1);
                                    L2.resolve();
                                },
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
        jasm.leaveScope();
    }

    // TODO: temp testing...
    jasm.sourceLocation = oldLoc;
}





// TODO: ...
function visitExpression(jasm: Emitter, expr: Expression|SpreadElement, $T: Register) {

    // TODO: ...
    let visitExpr = (expr: Expression|SpreadElement, $T: Register) => visitExpression(jasm, expr, $T);

    // TODO: ...
    let oldLoc = jasm.sourceLocation;
    jasm.sourceLocation = expr.loc;

    // TODO: ...
    matchNode<void>(expr, {
        // ------------------------- core -------------------------
        ArrayExpression:        expr => {
                                    jasm.NEWARR($T);
                                    jasm.withRegisters($0 => {
                                        expr.elements.forEach((el, i) => {
                                            visitExpr(el, $0);
                                            jasm.STORE($T, i, $0);
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
                                            jasm.STORE(jasm.ENV, expr.left.name, $T);
                                        }
                                        else {
                                            let left = expr.left;
                                            jasm.withRegisters(($0, $1) => {
                                                visitExpr(left.object, $0);
                                                visitExpr(left.property, $1);
                                                jasm.STORE($0, $1, $T);
                                            });
                                        }
                                    }

                                    // Handle compound assignment + operation
                                    else {
                                        let operation = (operator: string, $T: Register, $0: Register) => {
                                            switch (operator) {
                                                case '+=': return jasm.ADD($T, $0, $T);
                                                case '-=': return jasm.SUB($T, $0, $T);
                                                case '*=': return jasm.MUL($T, $0, $T);
                                                case '/=': return jasm.DIV($T, $0, $T);
                                                // TODO: "%=" | "<<=" | ">>=" | ">>>=" | "|=" | "^=" | "&=";
                                                default: throw new Error(`Unsupported assignment operator: '${expr.operator}'`);
                                            }
                                        }
                                        if (t.isIdentifier(expr.left)) {
                                            let left = expr.left;
                                            jasm.withRegisters($0 => {
                                                jasm.LOAD($0, jasm.ENV, left.name);
                                                visitExpr(expr.right, $T);
                                                operation(expr.operator, $T, $0);
                                            });
                                            jasm.STORE(jasm.ENV, left.name, $T);
                                        }
                                        else {
                                            let left = expr.left;
                                            jasm.withRegisters(($0, $1, $2) => {
                                                visitExpr(left.object, $1);
                                                visitExpr(left.property, $2);
                                                jasm.LOAD($0, $1, $2);
                                                visitExpr(expr.right, $T);
                                                operation(expr.operator, $T, $0);
                                                jasm.STORE($1, $2, $T);
                                            });
                                        }
                                    }
                                },
        BinaryExpression:       expr => {
                                    visitExpr(expr.left, $T);
                                    jasm.withRegisters($0 => {
                                        visitExpr(expr.right, $0);
                                        switch (expr.operator) {
                                            case '+':   return jasm.ADD($T, $T, $0);
                                            case '-':   return jasm.SUB($T, $T, $0);
                                            case '*':   return jasm.MUL($T, $T, $0);
                                            case '/':   return jasm.DIV($T, $T, $0);
                                            case '===': return jasm.EQ($T, $T, $0);
                                            case '!==': return jasm.NE($T, $T, $0);
                                            case '>=':  return jasm.GE($T, $T, $0);
                                            case '>':   return jasm.GT($T, $T, $0);
                                            case '<=':  return jasm.LE($T, $T, $0);
                                            case '<':   return jasm.LT($T, $T, $0);
                                            // TODO: "%" | "**" | "&" | "|" | ">>" | ">>>" | "<<" | "^" | "==" | "!=" | "in" | "instanceof";
                                            default: throw new Error(`Unsupported binary operator: '${expr.operator}'`);
                                        }
                                    });
                                },
        Identifier:             expr => {
                                    jasm.LOAD($T, jasm.ENV, expr.name);
                                },
        CallExpression:         expr => {
                                    if (t.isIdentifier(expr.callee)) {
                                        let callee = expr.callee;
                                        jasm.withRegisters(($0, $1) => {
                                            jasm.LOAD($T, jasm.ENV, callee.name);
                                            jasm.NEWARR($0);
                                            expr.arguments.forEach((arg, i) => {
                                                visitExpr(arg, $1);
                                                jasm.STORE($0, i, $1);
                                            });
                                            jasm.LOADC($1, null); // TODO: set 'this' - should be what? global object? undefined?
                                            jasm.CALL($T, $T, $1, $0);
                                        });
                                    }
                                    else {
                                        // TODO: MemberExpression, others? Need to set `this` if callee is a member expression...
                                        throw new Error(`Unsupported callee type: '${expr.callee.type}'`);
                                    }
                                },
        ConditionalExpression:  expr => {
                                    let L1 = jasm.newLabel();
                                    let L2 = jasm.newLabel();
                                    visitExpr(expr.test, $T);
                                    jasm.BF(L1, $T);
                                    visitExpr(expr.consequent, $T);
                                    jasm.B(L2);
                                    L1.resolve();
                                    visitExpr(expr.alternate, $T);
                                    L2.resolve();
                                },
        // FunctionExpression:  expr => [***],
        StringLiteral:          expr => {
                                    jasm.LOADC($T, expr.value);
                                },
        NumericLiteral:         expr => {
                                    jasm.LOADC($T, expr.value);
                                },
        NullLiteral:            expr => {
                                    jasm.LOADC($T, null);
                                },
        BooleanLiteral:         expr => {
                                    jasm.LOADC($T, expr.value);
                                },
        // RegExpLiteral:          expr => [***],
        LogicalExpression:      expr => {
                                    let L1 = jasm.newLabel();
                                    visitExpr(expr.left, $T);
                                    expr.operator === '&&' ? jasm.BF(L1, $T) : jasm.BT(L1, $T);
                                    visitExpr(expr.right, $T);
                                    L1.resolve();
                                },
        MemberExpression:       expr => {
                                    // TODO: refactor common code out of the following cases...
                                    if (!expr.computed) {
                                        // TODO: good example for TS assert(type) suggestion...
                                        assert(t.isIdentifier(expr.property));
                                        jasm.withRegisters($0 => {
                                            visitExpr(expr.object, $0);
                                            jasm.LOAD($T, $0, (<Identifier> expr.property).name);
                                        });
                                    }
                                    else if (t.isStringLiteral(expr.property) || t.isNumericLiteral(expr.property)) {
                                        let prop = expr.property;
                                        jasm.withRegisters($0 => {
                                            visitExpr(expr.object, $0);
                                            jasm.LOAD($T, $0, prop.value);
                                        });
                                    }
                                    else {
                                        jasm.withRegisters(($0, $1) => {
                                            visitExpr(expr.object, $0);
                                            visitExpr(expr.property, $1);
                                            jasm.LOAD($T, $0, $1);
                                        });
                                    }
                                },
        // NewExpression:       expr => [***],
        ObjectExpression:       expr => {
                                    jasm.NEWOBJ($T);
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
                                                jasm.withRegisters($0 => {
                                                    visitExpr(prop.value, $0);
                                                    jasm.STORE($T, key, $0);
                                                });
                                            }
                                            else {
                                                jasm.withRegisters(($0, $1) => {
                                                    visitExpr(prop.key, $0);
                                                    visitExpr(prop.value, $1);
                                                    jasm.STORE($T, $0, $1);
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
                                        case '-':   return jasm.NEG($T, $T);
                                        case '!':   return jasm.NOT($T, $T);
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
    jasm.sourceLocation = oldLoc;
}