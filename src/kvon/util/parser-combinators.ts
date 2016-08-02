




/**
 * A function that attempts to match a specific textual pattern at the current position in `src.
 * If the match fails, the function returns false and `src` remains unchanged. If the match succeeds,
 * the function returns true and `src.pos` is advanced to point to the first character *after* the
 * matched text.
 */
export interface Parser {
    (src: Source): boolean;
}





/**
 * A representation of the residual string of source text that has not yet been parsed. For performance
 * reasons, the entire text is passed around unchanged, but the current pointer into the text is updated
 * as parsing progresses.
 */
export interface Source {
    text: string;
    len: number;
    pos: number;
}





/** Creates a parser that matches an ordered sequence of patterns, as given by `exprs`. */
export function series(...exprs: Parser[]): Parser {
    return (src) => {
        let startPos = src.pos;
        if (exprs.every(expr => expr(src))) return true;
        src.pos = startPos;
        return false;
    };
}





/** Creates a parser that matches an ordered choice between patterns, as given by `exprs`. */
export function choice(...exprs: Parser[]): Parser {
    return (src) => exprs.some(expr => expr(src));
}





/**
 * Creates a parser that optionally matches the pattern given by `expr`. That is, the
 * parser always returns true, but only advances the source text if `expr` was matched.
 */
export function option(expr: Parser): Parser {
    return (src) => {
        expr(src);
        return true;
    };
}





/** Creates a parser that greedily matches zero or more occurences of the pattern given by `expr`. */
export function zeroOrMore(expr: Parser): Parser {
    return (src) => {
        while (expr(src)) { }
        return true;
    }
}





/** Creates a parser that greedily matches one or more occurences of the pattern given by `expr`. */
export function oneOrMore(expr: Parser): Parser {
    return series(expr, zeroOrMore(expr));
}





/**
 * Creates a parser the matches if and only if the pattern given by `expr` does *not* match the source.
 * The returned parser is a *predicate*, because it checks a condition but never advances the source position.
 */
export function not(expr: Parser): Parser {
    return (src) => {
        let startPos = src.pos;
        let result = !expr(src);
        src.pos = startPos;
        return result;
    }
}





/**
 * Creates a parser that matches a specific character or a range of characters.
 * If no arguments are supplied, the returned parser matches any character.
 */
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





/**
 * Creates a parser that matches any one of the characters given by the arguments.
 * Any number of arguments may be supplied, and each one is expected to be a single character.
 */
export function chars(...candidates: string[]): Parser {
    return choice(...candidates.map(c => char(c)));
}





/**
 * Creates a parser that is functionally identical to the parser returned by the given function `init`.
 * However, `init` is not called until the first call is made to the returned parser function. All
 * subsequent calls to the returned parser reuse the same value returned by the first call to `init`.
 */
export function lazy(init: () => Parser): Parser {
    let parser: Parser;
    return (src) => {
        parser = parser || (parser = init());
        return parser(src);
    }
}
