




export interface Source {
    text: string;
    len: number;
    pos: number;
}





export interface Parser {
    (src: Source): boolean;
}





export function series(...exprs: Parser[]): Parser {
    return (src) => {
        let startPos = src.pos;
        if (exprs.every(expr => expr(src))) return true;
        src.pos = startPos;
        return false;
    };
}





export function choice(...exprs: Parser[]): Parser {
    return (src) => exprs.some(expr => expr(src));
}





export function option(expr: Parser): Parser {
    return (src) => {
        expr(src);
        return true;
    };
}





export function zeroOrMore(expr: Parser): Parser {
    return (src) => {
        while (expr(src)) { }
        return true;
    }
}





export function oneOrMore(expr: Parser): Parser {
    return series(expr, zeroOrMore(expr));
}





export function not(expr: Parser): Parser {
    return (src) => {
        let startPos = src.pos;
        let result = !expr(src);
        src.pos = startPos;
        return result;
    }
}





export function char(lo?: string, hi?: string): Parser {
    let anyChar = arguments.length === 0;
    hi = hi || lo;
    return (src) => {
        if (src.pos >= src.len) return false;
        if (!anyChar && (src.text[src.pos] < lo || src.text[src.pos] > hi)) return false;
        ++src.pos;
        return true;
    };
}





export function chars(...candidates: string[]): Parser {
    return choice(...candidates.map(c => char(c)));
}





export function lazy(init: () => Parser): Parser {
    let parser: Parser;
    return (src) => {
        parser = parser || (parser = init());
        return parser(src);
    }
}
