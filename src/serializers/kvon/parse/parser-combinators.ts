




export interface Source {
    text: string;
    len: number;
    pos: number;
}





export interface Parser {
    (src: Source): boolean;
    <T>(src: Source, post: (isMatch: boolean, startPos: number) => T): T;
}





export const STD_POST = (isMatch: boolean, startPos: number) => isMatch;





export function series(...exprs: Parser[]): Parser {
    return (src, post = STD_POST) => {
        let startPos = src.pos;
        if (exprs.every(expr => expr(src))) return post(true, startPos);
        src.pos = startPos;
        return post(false, startPos);
    };
}





export function choice(...exprs: Parser[]): Parser {
    return (src, post = STD_POST) => {
        let startPos = src.pos;
        let result = exprs.some(expr => expr(src));
        return post(result, startPos);
    }
}





export function option(expr: Parser): Parser {
    return (src, post = STD_POST) => {
        let startPos = src.pos;
        expr(src);
        return post(true, startPos);
    };
}





export function zeroOrMore(expr: Parser): Parser {
    return (src, post = STD_POST) => {
        let startPos = src.pos;
        while (expr(src)) { }
        return post(true, startPos);
    }
}





export function oneOrMore(expr: Parser): Parser {
    return series(expr, zeroOrMore(expr));
}





export function not(expr: Parser): Parser {
    return (src, post = STD_POST) => {
        let startPos = src.pos;
        let result = !expr(src);
        src.pos = startPos;
        return post(result, startPos);
    }
}





export function char(lo?: string, hi?: string): Parser {
    let anyChar = arguments.length === 0;
    hi = hi || lo;
    return (src, post = STD_POST) => {
        if (src.pos >= src.len) return post(false, src.pos);
        if (anyChar) return post(true, src.pos++);
        if (src.text[src.pos] < lo || src.text[src.pos] > hi) return post(false, src.pos);
        return post(true, src.pos++);
    };
}





export function expect(expected: string, expr: Parser): Parser {
    return (src, post = STD_POST) => {
        let startPos = src.pos;
        if (expr(src)) return post(true, startPos);
        let before = (src.pos > 10 ? '...' : '') + src.text.slice(src.pos - 10, src.pos);
        let after = src.text.slice(src.pos + 1, src.pos + 11) + (src.len - src.pos > 11 ? '...' : '');
        let indicator = `${before}-->${src.text[src.pos]}<--${after}`;
        throw new Error(`KVON: expected ${expected} but found '${src.text[src.pos]}': "${indicator}"`);
    }
}





export function lazy(init: () => Parser): Parser {
    let parser: Parser;
    return (src, post = STD_POST) => {
        parser = parser || (parser = init());
        return parser(src, post);
    }
}
