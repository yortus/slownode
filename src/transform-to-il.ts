import * as babel from 'babel';
import {Node, Statement, Expression, Identifier, SpreadElement} from "babel-types";    // Elided (used only for types)
import {Binding as BabelBinding} from "babel-traverse";                 // Elided (used only for types)
import * as types from "babel-types";                                   // Elided (used only for types)
import * as assert from 'assert';
import matchNode from './match-node';
import Register from './register';
import IL from './il';





export default function transformToIL({types: t}: typeof babel,  prog: types.Program, scopes: WeakMap<Node, BabelBinding[]>, il: IL) {
    let visitCounter = 0;
    visitStmt(prog);
    il.NOOP();

    function visitStmt(stmt: Node) {

        // TODO: temp testing...
        // if (scopes.has(stmt)) {
        //     il.enterScope(scopes.get(stmt));
        // }
        
        let label = ((i) => (strs) => `${strs[0]}-${i}`)(++visitCounter);
        matchNode<void>(stmt, {
            // ------------------------- core -------------------------
            // Directive:           stmt => [***],
            // DirectiveLiteral:    stmt => [***],
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
                                        il.withRegisters($0 => {
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
                                    },
            // ForStatement:        stmt => [***],
            // FunctionDeclaration: stmt => [***],
            IfStatement:            stmt => {
                                        let L1 = il.newLabel();
                                        let L2 = il.newLabel();
                                        il.withRegisters($0 => {
                                            visitExpr(stmt.test, $0);
                                            il.BF(L1, $0);
                                        });
                                        visitStmt(stmt.consequent);
                                        if (stmt.alternate) il.B(L2);
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
        // if (scopes.has(stmt)) {
        //     il.leaveScope();
        // }
    }
    function visitExpr(expr: Expression|SpreadElement, $T: Register) {
        let label = ((i) => (strs) => `${strs[0]}-${i}`)(++visitCounter);
        matchNode<void>(expr, {
            // ------------------------- core -------------------------
            ArrayExpression:        expr => {
                                        il.NEWARR($T);
                                        il.withRegisters($0 => {
                                            expr.elements.forEach((el, i) => {
                                                visitExpr(el, $0);
                                                il.STORE($T, i, $0);
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
                                                il.STORE(il.ENV, expr.left.name, $T);
                                            }
                                            else {
                                                let left = expr.left;
                                                il.withRegisters(($0, $1) => {
                                                    visitExpr(left.object, $0);
                                                    visitExpr(left.property, $1);
                                                    il.STORE($0, $1, $T);
                                                });
                                            }
                                        }

                                        // Handle compound assignment + operation
                                        else {
                                            let operation = (operator: string, $T: Register, $0: Register) => {
                                                switch (operator) {
                                                    case '+=': return il.ADD($T, $0, $T);
                                                    case '-=': return il.SUB($T, $0, $T);
                                                    case '*=': return il.MUL($T, $0, $T);
                                                    case '/=': return il.DIV($T, $0, $T);
                                                    // TODO: "%=" | "<<=" | ">>=" | ">>>=" | "|=" | "^=" | "&=";
                                                    default: throw new Error(`Unsupported assignment operator: '${expr.operator}'`);
                                                }
                                            }
                                            if (t.isIdentifier(expr.left)) {
                                                let left = expr.left;
                                                il.withRegisters($0 => {
                                                    il.LOAD($0, il.ENV, left.name);
                                                    visitExpr(expr.right, $T);
                                                    operation(expr.operator, $T, $0);
                                                });
                                                il.STORE(il.ENV, left.name, $T);
                                            }
                                            else {
                                                let left = expr.left;
                                                il.withRegisters(($0, $1, $2) => {
                                                    visitExpr(left.object, $1);
                                                    visitExpr(left.property, $2);
                                                    il.LOAD($0, $1, $2);
                                                    visitExpr(expr.right, $T);
                                                    operation(expr.operator, $T, $0);
                                                    il.STORE($1, $2, $T);
                                                });
                                            }
                                        }
                                    },
            BinaryExpression:       expr => {
                                        visitExpr(expr.left, $T);
                                        il.withRegisters($0 => {
                                            visitExpr(expr.right, $0);
                                            switch (expr.operator) {
                                                case '+':   return il.ADD($T, $T, $0);
                                                case '-':   return il.SUB($T, $T, $0);
                                                case '*':   return il.MUL($T, $T, $0);
                                                case '/':   return il.DIV($T, $T, $0);
                                                case '===': return il.EQ($T, $T, $0);
                                                case '!==': return il.NE($T, $T, $0);
                                                case '>=':  return il.GE($T, $T, $0);
                                                case '>':   return il.GT($T, $T, $0);
                                                case '<=':  return il.LE($T, $T, $0);
                                                case '<':   return il.LT($T, $T, $0);
                                                // TODO: "%" | "**" | "&" | "|" | ">>" | ">>>" | "<<" | "^" | "==" | "!=" | "in" | "instanceof";
                                                default: throw new Error(`Unsupported binary operator: '${expr.operator}'`);
                                            }
                                        });
                                    },
            Identifier:             expr => {
                                        il.LOAD($T, il.ENV, expr.name);
                                    },
            // CallExpression:         expr => {
            //                             // TODO: BUG! Need to set `this` if callee is a member expression, need to check callee in general...
            //                             assert(t.isIdentifier(expr.callee)); // TODO: temp testing...
            //                             visitExpr(expr.callee);
            //                             expr.arguments.forEach(visitExpr);
            //                             il.roll(expr.arguments.length + 1);
            //                             il.call(expr.arguments.length);
            //                         },
            ConditionalExpression:  expr => {
                                        let L1 = il.newLabel();
                                        let L2 = il.newLabel();
                                        visitExpr(expr.test, $T);
                                        il.BF(L1, $T);
                                        visitExpr(expr.consequent, $T);
                                        il.B(L2);
                                        L1.resolve();
                                        visitExpr(expr.alternate, $T);
                                        L2.resolve();
                                    },
            // FunctionExpression:  expr => [***],
            StringLiteral:          expr => {
                                        il.LOADC($T, expr.value);
                                    },
            NumericLiteral:         expr => {
                                        il.LOADC($T, expr.value);
                                    },
            NullLiteral:            expr => {
                                        il.LOADC($T, null);
                                    },
            BooleanLiteral:         expr => {
                                        il.LOADC($T, expr.value);
                                    },
            // RegExpLiteral:          expr => {
            //                             // TODO: use proper new/construct opcode...
            //                             il.push(expr.pattern);
            //                             il.push(expr.flags || '');
            //                             il.calli2(`%constructRegExp%`);
            // },
            // LogicalExpression:      expr => {
            //                             visitExpr(expr.left);
            //                             if (expr.operator === '&&') {
            //                                 il.bf(label`exit`);
            //                             }
            //                             else {
            //                                 il.bt(label`exit`);
            //                             }
            //                             il.pop();
            //                             visitExpr(expr.right);
            //                             il.label(label`exit`);
            //                         },
            MemberExpression:       expr => {
                                        if (!expr.computed) {
                                            il.withRegisters($0 => {
                                                // TODO: good example for TS assert(type) suggestion...
                                                assert(t.isIdentifier(expr.property));
                                                visitExpr(expr.object, $0);
                                                il.LOAD($T, $0, (<Identifier> expr.property).name);
                                            });
                                        }
                                        else if (t.isStringLiteral(expr.property) || t.isNumericLiteral(expr.property)) {
                                            let prop = expr.property;
                                            il.withRegisters($0 => {
                                                visitExpr(expr.object, $0);
                                                il.LOAD($T, $0, prop.value);
                                            });
                                        }
                                        else {
                                            il.withRegisters(($0, $1) => {
                                                visitExpr(expr.object, $0);
                                                visitExpr(expr.property, $1);
                                                il.LOAD($T, $0, $1);
                                            });
                                        }
                                    },
            // NewExpression:       expr => [***],
            // ObjectExpression:    expr => [***],
            // ObjectMethod:        expr => [***],
            // ObjectProperty:      expr => [***],
            // SequenceExpression:     expr => {
            //                             for (let len = expr.expressions.length, i = 0; i < len; ++i) {
            //                                 visitExpr(expr.expressions[i]);
            //                                 if (i < len - 1) il.pop();
            //                             }
            //                         },
            // ThisExpression:      expr => [***],
            // UnaryExpression:        expr => {
            //                             visitExpr(expr.argument);
            //                             il.calli1(expr.operator);
            //                         },
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
    }
}
