'use strict';





export default class EvaluationStack {


    push(val: any) {
        this._stack.push(val);
    }


    pop() {
        return this._stack.pop();
    }


    binary(op: string) {
        let rhs = this.pop();
        let lhs = this.pop();
        let expr = `(${JSON.stringify(lhs)} ${op} ${JSON.stringify(rhs)})`;
        let result = eval(expr);
        this.push(result);
    }

    private _stack = [];
}
