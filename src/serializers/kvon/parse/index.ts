import Reviver from './reviver';
export {Reviver};





// TODO: implement parse...
export default function parse(text: string, reviver?: Reviver): {} {
    // TODO: ...
    let pos = 0;
    interface Parser {
        (): boolean;
    }

    function series(...exprs: Parser[]): Parser {
        return () => {
            let startPos = pos;
            if (exprs.every(expr => expr())) return true;
            pos = startPos;
            return false;
        };
    }

    function choice(...exprs: Parser[]): Parser {
        return () => exprs.some(expr => expr());
    }

    function option(expr: Parser) {
        return () => (expr(), true);
    }

    function zeroOrMore(expr: Parser): Parser {
        return () => {
            while (expr()) {}
            return true;
        }
    }

    function oneOrMore(expr: Parser): Parser {
        return series(expr, zeroOrMore(expr));
    }

    function not(expr: Parser): Parser {
        return () => {
            let oldPos = pos;
            let result = !expr();
            pos = oldPos;
            return result;
        }
    }

    function char(lo?: string, hi?: string): Parser {
        if (arguments.length === 0) return () => pos < text.length ? (++pos, true) : false;
        return () => text[pos] >= lo && text[pos] <= (hi || lo) ? (++pos, true) : false;
    }





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
    function value(): boolean {
        let rule: () => boolean = value['rule'] || (value['rule'] = choice(
            NULL,
            TRUE,
            FALSE,
            number,
            string,
            array,
            object
        ));
        return rule();
    }

    const jsonText = series(
        WHITESPACE,
        value,
        WHITESPACE,
        not(char())
    );



    let success = jsonText();
    return success;


}
