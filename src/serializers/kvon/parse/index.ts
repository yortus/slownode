import Reviver from './reviver';
export {Reviver};





// Parser Combinators
interface Source {
    text: string;
    len: number;
    pos: number;
}
interface Parser {
    (src: Source): boolean;
}
function series(...exprs: Parser[]): Parser {
    return (src) => {
        let startPos = src.pos;
        if (exprs.every(expr => expr(src))) return true;
        src.pos = startPos;
        return false;
    };
}
function choice(...exprs: Parser[]): Parser {
    return (src) => exprs.some(expr => expr(src));
}
function option(expr: Parser): Parser {
    return (src) => (expr(src), true);
}
function zeroOrMore(expr: Parser): Parser {
    return (src) => {
        while (expr(src)) { }
        return true;
    }
}
function oneOrMore(expr: Parser): Parser {
    return series(expr, zeroOrMore(expr));
}
function not(expr: Parser): Parser {
    return (src) => {
        let oldPos = src.pos;
        let result = !expr(src);
        src.pos = oldPos;
        return result;
    }
}
function char(lo?: string, hi?: string): Parser {
    if (arguments.length === 0) {
        return (src) => src.pos < src.len ? (++src.pos, true) : false;
    }
    else {
        return (src) => src.text[src.pos] >= lo && src.text[src.pos] <= (hi || lo) ? (++src.pos, true) : false;
    }
}
function expect(expected: string, expr: Parser): Parser {
    return (src) => {
        if (expr(src)) return true;
        let before = (src.pos > 10 ? '...' : '') + src.text.slice(src.pos - 10, src.pos);
        let after = src.text.slice(src.pos + 1, src.pos + 11) + (src.len - src.pos > 11 ? '...' : '');
        let indicator = `${before}-->${src.text[src.pos]}<--${after}`;
        throw new Error(`KVON: expected ${expected} but found '${src.text[src.pos]}': "${indicator}"`);
    }
}





// TODO: implement parse...
export default function parse(text: string, reviver?: Reviver): {} {
    // TODO: ...

    const BACKSLASH = char('\\');
    const COLON = char(':');
    const COMMA = char(',');
    const CONTROL_CHAR = char('\u0000', '\u001f');
    const DECIMAL = char('.');
    const DIGITS = oneOrMore(char('0', '9'));
    const E = choice(char('e'), char('E'));
    const FALSE = series(char('f'), char('a'), char('l'), char('s'), char('e'));
    const HEX_DIGIT = choice(char('0', '9'), char('a', 'f'), char('A', 'F'));
    const LEFT_BRACE = char('{');
    const LEFT_BRACKET = char('[');
    const MINUS = char('-');
    const NULL = series(char('n'), char('u'), char('l'), char('l'));
    const QUOTATION_MARK = char('"');
    const RIGHT_BRACE = char('}');
    const RIGHT_BRACKET = char(']');
    const SIGN = choice(char('-'), char('+'));
    const TRUE = series(char('t'), char('r'), char('u'), char('e'));
    const WHITESPACE = zeroOrMore(choice(char(' '), char('\t'), char('\r'), char('\n')));
    const ZERO = char('0');

    const number = series(
        option(MINUS),
        choice(ZERO, DIGITS),
        option(series(DECIMAL, DIGITS)),
        option(series(E, option(SIGN), DIGITS))
    );

    const string = series(
        QUOTATION_MARK,
        zeroOrMore(
            choice(
                series(
                    not(
                        choice(
                            QUOTATION_MARK,
                            BACKSLASH,
                            CONTROL_CHAR
                        )
                    ),
                    char()
                ),
                series(
                    char('\\'),
                    choice(
                        char('"'),
                        char('\\'),
                        char('/'),
                        char('b'),
                        char('f'),
                        char('n'),
                        char('r'),
                        char('t'),
                        series(char('u'), HEX_DIGIT, HEX_DIGIT, HEX_DIGIT, HEX_DIGIT)
                    )
                )
            )
        ),
        QUOTATION_MARK
    );

    const array = series(
        LEFT_BRACKET,
        WHITESPACE,
        option(
            series(
                value,
                zeroOrMore(
                    series(
                        WHITESPACE,
                        COMMA,
                        WHITESPACE,
                        value
                    )
                )
            )
        ),
        WHITESPACE,
        RIGHT_BRACKET
    );

    const nameValuePair = series(
        string,
        WHITESPACE,
        COLON,
        WHITESPACE,
        value
    );

    const object = series(
        LEFT_BRACE,
        WHITESPACE,
        option(
            series(
                nameValuePair,
                zeroOrMore(
                    series(
                        WHITESPACE,
                        COMMA,
                        WHITESPACE,
                        nameValuePair
                    )
                )
            )
        ),
        WHITESPACE,
        RIGHT_BRACE
    );

    // TODO: explain why this one is a function unlike the others (support circular refs)...
    function value(src: Source): boolean {
        let rule: (src: Source) => boolean = value['rule'] || (value['rule'] = choice(
            NULL,
            TRUE,
            FALSE,
            number,
            string,
            array,
            object
        ));
        return rule(src);
    }

    const jsonText = expect('JSON',
        series(
            WHITESPACE,
            value,
            WHITESPACE,
            expect('end of string', not(char()))
        )
    );


    try {
        let success = jsonText({text, len: text.length, pos: 0});
        return success;
    }
    catch (err) {
        console.log(err);
    }

}
