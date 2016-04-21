'use strict';
import * as assert from 'assert';





export class LValue {
    constructor(object: Object, key: string) {
        this.object = object;
        this.key = key;
    }
    readonly object: Object;
    readonly key: string | number;
}





export type RValue = number | string | boolean | RegExp | Date | Object | Array<any>;





export type AssignmentOperator = "=" | "+=" | "-=" | "*=" | "/=" | "%=" | "<<=" | ">>=" | ">>>=" | "|=" | "^=" | "&=";
export type BinaryOperator = "+" | "-" | "/" | "%" | "*" | "**" | "&" | "|" | ">>" | ">>>" | "<<" | "^" | "==" | "===" | "!=" | "!==" | "in" | "instanceof" | ">" | "<" | ">=" | "<=";
export type UnaryOperator = "-" | "+" | "!" | "~" | "typeof" | "void" | "delete";
export type LogicalOperator = "||" | "&&";
export type UpdateOperator = "++" | "--";





export default class Evaluator {


    push(value: LValue | RValue) {
        this._stack.push(value);
    }


    pop(): RValue {
        return asRValue(this._stack.pop());
    }


    assignment(op: AssignmentOperator): void {
        let rhs = this.pop();
        let lhs = this._stack.pop(); // NB: preserve lvalue-ness
        assert(lhs instanceof LValue, `LHS of assignment expression must be an l-value`);
        let result = eval(`(lhs.object[lhs.key] ${op} rhs)`);
        this.push(result);
    }


    binary(op: BinaryOperator): void {
        let rhs = this.pop();
        let lhs = this.pop();
        let result = eval(`(lhs ${op} rhs)`);
        this.push(result);
    }


    unary(op: UnaryOperator): void {
        let arg = this.pop();
        let result = eval(`(${op} arg)`);
        this.push(result);
    }


    logical(op: LogicalOperator): void {
        let rhs = this.pop();
        let lhs = this.pop();
        let result = eval(`(lhs ${op} rhs)`);
        this.push(result);
    }


    update(op: UpdateOperator, prefix: boolean): void {
        let arg = this._stack.pop(); // NB: preserve lvalue-ness
        assert(arg instanceof LValue, `Argument of update expression must be an l-value`);
        let result = eval(`(${prefix ? op : ''} arg.object[arg.key] ${prefix ? '' : op})`);
        this.push(result);
    }


    private _stack: Array<LValue | RValue> = [];
}





function asRValue(value: LValue | RValue): RValue {
    if (value instanceof LValue) {
        return value.object[value.key];
    }
    else {
        return value;
    }
}
