'use strict';
import Binding from './binding';



export type Member = {};

export type Primitive = Binding | Member | number | string | boolean | RegExp | Date | Object | Array<any>;



type AssignmentOperator = "=" | "+=" | "-=" | "*=" | "/=" | "%=" | "<<=" | ">>=" | ">>>=" | "|=" | "^=" | "&=";

type BinaryOperator = "+" | "-" | "/" | "%" | "*" | "**" | "&" | "|" | ">>" | ">>>" | "<<" | "^" | "==" | "===" | "!=" | "!==" | "in" | "instanceof" | ">" | "<" | ">=" | "<=";

type UnaryOperator = "-" | "+" | "!" | "~" | "typeof" | "void" | "delete";

type LogicalOperator = "||" | "&&";

type UpdateOperator = "++" | "--";


export default class Evaluator {


    push(value: Primitive) {
    }


    pop(): Primitive {
    }


    assignment    
    


}





function validateValue(value: Primitive) {
    // TODO: ...
}
