import * as assert from 'assert';
import {Node, File, Program as ProgramNode} from "babel-types";             // Elided (used only for types)
import {Statement, Expression, Identifier} from "babel-types";              // Elided (used only for types)
import {StringLiteral, NumericLiteral, SpreadElement} from "babel-types";   // Elided (used only for types)
import {types as t} from './babel';
import JasmEmitter from './jasm-emitter';
import Jasm from '../../formats/jasm';
import Label from './label';
import matchNode from './match-node';
import Register from '../../formats/jasm/register';





// TODO: ... make second arg optional
export default function astToJasm(ast: Node, typeScriptSource: string): Jasm {
    assert(t.isFile(ast));
    let emit = new JasmEmitter(typeScriptSource);
    visitStatement(emit, (<File> ast).program);
    let jasmText = emit.build();
    return jasmText;
}





// TODO: ...
function visitStatement(emit: JasmEmitter, stmt: Statement|ProgramNode) {

    // TODO: ...
    let visitStmt = (stmt: Statement) => visitStatement(emit, stmt);
    let visitExpr = (expr: Expression|SpreadElement, $T: Register) => visitExpression(emit, expr, $T);

    // TODO: temp testing...
    emit.setSourceLocation(stmt.loc);

    // TODO: temp testing...
    if (stmt.scope) {
        emit.enterScope(stmt.scope);
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
                                    emit.withRegisters($0 => {
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
                                        emit.withRegisters(($0, $1) => {
                                            decl.init ? visitExpr(decl.init, $0) : emit.UNDEFD($0);
                                            if (t.isIdentifier(decl.id)) {
                                                emit.STRING($1, decl.id.name);
                                                emit.STORE(emit.ENV, $1, $0);
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
                                    let L1 = new Label();
                                    let L2 = new Label();
                                    emit.withRegisters($0 => {
                                        visitExpr(stmt.test, $0);
                                        emit.BF(L1, $0);
                                    });
                                    visitStmt(stmt.consequent);
                                    if (stmt.alternate) emit.B(L2);
                                    emit.LABEL(L1);
                                    visitStmt(stmt.alternate || t.blockStatement([]));
                                    emit.LABEL(L2);
                                },
        // LabeledStatement:    stmt => [***],
        // ReturnStatement:     stmt => [***],
        // SwitchCase:          stmt => [***],
        // SwitchStatement:     stmt => [***],
        ThrowStatement:         stmt => {
                                    emit.withRegisters($0 => {
                                        visitExpr(stmt.argument, $0);
                                        emit.THROW($0);
                                    });
                                },
        // TryStatement:        stmt => [***],
        // VariableDeclarator:  stmt => [***],
        WhileStatement:         stmt => {
                                    let L1 = new Label();
                                    let L2 = new Label();
                                    emit.LABEL(L1);
                                    emit.withRegisters($0 => {
                                        visitExpr(stmt.test, $0);
                                        emit.BF(L2, $0);
                                    });
                                    visitStmt(stmt.body);
                                    emit.B(L1);
                                    emit.LABEL(L2);
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
        emit.leaveScope();
    }
}





// TODO: ...
function visitExpression(emit: JasmEmitter, expr: Expression|SpreadElement, $T: Register) {

    // TODO: ...
    let visitExpr = (expr: Expression|SpreadElement, $T: Register) => visitExpression(emit, expr, $T);

    // TODO: temp testing...
    emit.setSourceLocation(expr.loc);

    // TODO: ...
    matchNode<void>(expr, {
        // ------------------------- core -------------------------
        ArrayExpression:        expr => {
                                    emit.ARRAY($T);
                                    emit.withRegisters(($0, $1) => {
                                        expr.elements.forEach((el, i) => {
                                            visitExpr(el, $0);
                                            emit.NUMBER($1, i);
                                            emit.STORE($T, $1, $0);
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
                                            let left = expr.left;
                                            emit.withRegisters($0 => {
                                                emit.STRING($0, left.name);
                                                emit.STORE(emit.ENV, $0, $T);
                                            });
                                        }
                                        else {
                                            if (!t.isIdentifier(expr.left.property) &&!t.isStringLiteral(expr.left.property)) {
                                                throw new Error(`Unsupported property type: '${expr.left.property.type}'`);
                                            }
                                            let left = expr.left, prop = expr.left.property;
                                            emit.withRegisters(($0, $1) => {
                                                visitExpr(left.object, $0);
                                                emit.STRING($1, t.isIdentifier(prop) ? prop.name : prop.value);
                                                emit.STORE($0, $1, $T);
                                            });
                                        }
                                    }

                                    // Handle compound arithmetic/assignment operation
                                    else {
                                        let operation = (operator: string, $T: Register, $0: Register) => {
                                            switch (operator) {
                                                case '+=': return emit.ADD($T, $0, $T);
                                                case '-=': return emit.SUB($T, $0, $T);
                                                case '*=': return emit.MUL($T, $0, $T);
                                                case '/=': return emit.DIV($T, $0, $T);
                                                // TODO: "%=" | "<<=" | ">>=" | ">>>=" | "|=" | "^=" | "&=";
                                                default: throw new Error(`Unsupported assignment operator: '${expr.operator}'`);
                                            }
                                        }
                                        if (t.isIdentifier(expr.left)) {
                                            let left = expr.left;
                                            emit.withRegisters($0 => {
                                                emit.STRING($0, left.name);
                                                emit.withRegisters($1 => {
                                                    emit.LOAD($1, emit.ENV, $0);
                                                    visitExpr(expr.right, $T);
                                                    operation(expr.operator, $T, $1);
                                                });
                                                emit.STORE(emit.ENV, $0, $T);
                                            });
                                        }
                                        else {
                                            let left = expr.left;
                                            emit.withRegisters(($0, $1, $2) => {
                                                visitExpr(left.object, $1);
                                                visitExpr(left.property, $2);
                                                emit.LOAD($0, $1, $2);
                                                visitExpr(expr.right, $T);
                                                operation(expr.operator, $T, $0);
                                                emit.STORE($1, $2, $T);
                                            });
                                        }
                                    }
                                },
        BinaryExpression:       expr => {
                                    visitExpr(expr.left, $T);
                                    emit.withRegisters($0 => {
                                        visitExpr(expr.right, $0);
                                        switch (expr.operator) {
                                            case '+':   return emit.ADD($T, $T, $0);
                                            case '-':   return emit.SUB($T, $T, $0);
                                            case '*':   return emit.MUL($T, $T, $0);
                                            case '/':   return emit.DIV($T, $T, $0);
                                            case '===': return emit.EQ($T, $T, $0);
                                            case '!==': return emit.NE($T, $T, $0);
                                            case '>=':  return emit.GE($T, $T, $0);
                                            case '>':   return emit.GT($T, $T, $0);
                                            case '<=':  return emit.LE($T, $T, $0);
                                            case '<':   return emit.LT($T, $T, $0);
                                            // TODO: "%" | "**" | "&" | "|" | ">>" | ">>>" | "<<" | "^" | "==" | "!=" | "in" | "instanceof";
                                            default: throw new Error(`Unsupported binary operator: '${expr.operator}'`);
                                        }
                                    });
                                },
        Identifier:             expr => {
                                    emit.withRegisters($0 => {
                                        emit.STRING($0, expr.name);
                                        emit.LOAD($T, emit.ENV, $0);
                                    });
                                },
        CallExpression:         expr => {
                                    if (t.isIdentifier(expr.callee)) {
                                        let callee = expr.callee;
                                        emit.withRegisters(($0, $1, $2) => {
                                            emit.STRING($T, callee.name);
                                            emit.LOAD($T, emit.ENV, $T);
                                            emit.ARRAY($0);
                                            expr.arguments.forEach((arg, i) => {
                                                visitExpr(arg, $1);
                                                emit.NUMBER($2, i);
                                                emit.STORE($0, $2, $1);
                                            });
                                            emit.NULL($1); // TODO: set 'this' - should be what? global object? undefined?
                                            emit.CALL($T, $T, $1, $0);
                                        });
                                    }
                                    else {
                                        // TODO: MemberExpression, others? Need to set `this` if callee is a member expression...
                                        throw new Error(`Unsupported callee type: '${expr.callee.type}'`);
                                    }
                                },
        ConditionalExpression:  expr => {
                                    let L1 = new Label();
                                    let L2 = new Label();
                                    visitExpr(expr.test, $T);
                                    emit.BF(L1, $T);
                                    visitExpr(expr.consequent, $T);
                                    emit.B(L2);
                                    emit.LABEL(L1);
                                    visitExpr(expr.alternate, $T);
                                    emit.LABEL(L2);
                                },
        // FunctionExpression:  expr => [***],
        StringLiteral:          expr => {
                                    emit.STRING($T, expr.value);
                                },
        NumericLiteral:         expr => {
                                    emit.NUMBER($T, expr.value);
                                },
        NullLiteral:            expr => {
                                    emit.NULL($T);
                                },
        BooleanLiteral:         expr => {
                                    expr.value ? emit.TRUE($T) : emit.FALSE($T);
                                },
        RegExpLiteral:          expr => {
                                    emit.REGEXP($T, expr.pattern, expr.flags);
                                },
        LogicalExpression:      expr => {
                                    let L1 = new Label();
                                    visitExpr(expr.left, $T);
                                    expr.operator === '&&' ? emit.BF(L1, $T) : emit.BT(L1, $T);
                                    visitExpr(expr.right, $T);
                                    emit.LABEL(L1);
                                },
        MemberExpression:       expr => {
                                    // TODO: refactor common code out of the following cases...
                                    if (!expr.computed) {
                                        // TODO: good example for TS assert(type) suggestion...
                                        assert(t.isIdentifier(expr.property));
                                        emit.withRegisters(($0, $1) => {
                                            visitExpr(expr.object, $0);
                                            emit.STRING($1, (<Identifier> expr.property).name);
                                            emit.LOAD($T, $0, $1);
                                        });
                                    }
                                    else if (t.isStringLiteral(expr.property) || t.isNumericLiteral(expr.property)) {
                                        let prop = expr.property;
                                        emit.withRegisters(($0, $1) => {
                                            visitExpr(expr.object, $0);
                                            if (t.isStringLiteral(prop)) {
                                                emit.STRING($1, prop.value);
                                            }
                                            else {
                                                emit.NUMBER($1, prop.value);
                                            }
                                            emit.LOAD($T, $0, $1);
                                        });
                                    }
                                    else {
                                        emit.withRegisters(($0, $1) => {
                                            visitExpr(expr.object, $0);
                                            visitExpr(expr.property, $1);
                                            emit.LOAD($T, $0, $1);
                                        });
                                    }
                                },
        // NewExpression:       expr => [***],
        ObjectExpression:       expr => {
                                    emit.OBJECT($T);
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
                                                emit.withRegisters(($0, $1) => {
                                                    visitExpr(prop.value, $0);
                                                    if (typeof key === 'string') {
                                                        emit.STRING($1, key);
                                                    }
                                                    else {
                                                        emit.NUMBER($1, key);
                                                    }
                                                    emit.STORE($T, $1, $0);
                                                });
                                            }
                                            else {
                                                emit.withRegisters(($0, $1) => {
                                                    visitExpr(prop.key, $0);
                                                    visitExpr(prop.value, $1);
                                                    emit.STORE($T, $0, $1);
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
                                        case '-':   return emit.NEG($T, $T);
                                        case '!':   return emit.NOT($T, $T);
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
        AwaitExpression:        expr => {
                                    visitExpr(expr.argument, $T);
                                    emit.PARK(...emit.usedRegisters());
                                    emit.AWAIT($T, $T);
                                }
    });
}
