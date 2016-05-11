import * as babel from 'babel';
import {Node, Statement, Expression, Identifier, SpreadElement} from "babel-types";    // Elided (used only for types)
import {Binding as BabelBinding} from "babel-traverse";                 // Elided (used only for types)
import * as types from "babel-types";                                   // Elided (used only for types)
import * as assert from 'assert';
import matchNode from './match-node';
import {Register} from './registers';
import IL from './il';





export default function transformToIL({types: t}: typeof babel,  prog: types.Program, scopes: WeakMap<Node, BabelBinding[]>, il: IL) {
    let visitCounter = 0;
    visitStmt(prog);

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
                                        il.using($0 => {
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
                                        let L1 = il.label();
                                        let L2 = il.label();
                                        il.using($0 => {
                                            visitExpr(stmt.test, $0);
                                            il.BF(L1, $0);
                                            visitStmt(stmt.consequent);
                                            il.B(L2);
                                            L1.resolve();
                                            visitStmt(stmt.alternate || t.blockStatement([]));
                                            L2.resolve();
                                        });
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
            // ArrayExpression:        expr => {
            //                             il.newarr(TGT);
            //                             regs.reserve((R0, R1) => {
            //                                 expr.elements.forEach((el, i) => {
            //                                     visitExpr(el, R0);
            //                                     il.ldc(R1, i);
            //                                     il.stm(TGT, R1, R0);
            //                                 });
            //                             });
            //                         },
            // AssignmentExpression:   expr => {
            //                             assert(expr.operator === '='); // TODO: BUG! handle all values of 'operator'
            //                             assert(t.isIdentifier(expr.left) || t.isMemberExpression(expr.left)); // TODO: safe to loosen this? What else could it be?

            //                             visitLVal(expr.left);
            //                             visitExpr(expr.right);
            //                             il.store();
            //                         },
            BinaryExpression:       expr => {
                                        visitExpr(expr.left, $T);
                                        il.using($0 => {
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
            // Identifier:             expr => {
            //                             il.env();
            //                             il.push(expr.name);
            //                             il.fetch();
            //                         },
            // CallExpression:         expr => {
            //                             // TODO: BUG! Need to set `this` if callee is a member expression, need to check callee in general...
            //                             assert(t.isIdentifier(expr.callee)); // TODO: temp testing...
            //                             visitExpr(expr.callee);
            //                             expr.arguments.forEach(visitExpr);
            //                             il.roll(expr.arguments.length + 1);
            //                             il.call(expr.arguments.length);
            //                         },
            // ConditionalExpression:  expr => {
            //                             visitExpr(expr.test);
            //                             il.bf(label`alternate`);
            //                             visitExpr(expr.consequent);
            //                             il.br(label`exit`);
            //                             il.label(label`alternate`);
            //                             visitExpr(expr.alternate);
            //                             il.label(label`exit`);
            //                         },
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
            // MemberExpression:       expr => {
            //                             visitExpr(expr.object);
            //                             if (expr.computed) {
            //                                 visitExpr(expr.property);
            //                             }
            //                             else {
            //                                 assert(t.isIdentifier(expr.property));
            //                                 il.push((<Identifier> expr.property).name);
            //                             }
            //                             il.fetch();
            //                         },
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
    function visitLVal(expr: Node) {
        let label = ((i) => (strs) => `${strs[0]}-${i}`)(++visitCounter);
        matchNode<void>(expr, {
            // ------------------------- core -------------------------
            // Identifier:             expr => {
            //                             il.env();
            //                             il.push(expr.name);
            //                         },
            // MemberExpression:       expr => {
            //                             visitExpr(expr.object);
            //                             if (expr.computed) {
            //                                 visitExpr(expr.property);
            //                             }
            //                             else {
            //                                 assert(t.isIdentifier(expr.property));
            //                                 il.push((<Identifier> expr.property).name);
            //                             }
            //                         },
            // RestElement:         expr => [***],

            // ------------------------- es2015 -------------------------
            // AssignmentPattern:   expr => [***],
            // ArrayPattern:        expr => [***],
            // ObjectPattern:       expr => [***],
        });
    }
}
