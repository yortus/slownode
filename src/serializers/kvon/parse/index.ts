import Reviver from './reviver';
export {Reviver};
import {series, choice, option, zeroOrMore, oneOrMore, not, char, chars, expect, lazy} from './parser-combinators';
import {Source, Parser} from './parser-combinators';





// TODO: implement parse...
export default function parse(text: string, reviver?: Reviver): {} {
    // TODO: ...

    // Terminals
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

    // Numbers
    const integerPart = choice(ZERO, DIGITS);
    const fractionalPart = option(series(DECIMAL, DIGITS));
    const exponentPart = option(series(E, option(SIGN), DIGITS));
    const number = series(option(MINUS), integerPart, fractionalPart, exponentPart);

    // Strings
    const unescapedChar = series(not(choice(QUOTATION_MARK, BACKSLASH, CONTROL_CHAR)), char());
    const escapedControlChar = series(BACKSLASH, chars('"', '\\', '/', 'b', 'f', 'n', 'r', 't'));
    const escapedUnicodeChar = series(BACKSLASH, char('u'), HEX_DIGIT, HEX_DIGIT, HEX_DIGIT, HEX_DIGIT)
    const escapedOrUnescapedChar = choice(unescapedChar, escapedControlChar, escapedUnicodeChar);
    const string = series(QUOTATION_MARK, zeroOrMore(escapedOrUnescapedChar), QUOTATION_MARK);

    // Arrays
    const commaList = (expr: Parser) => series(expr, zeroOrMore(series(WHITESPACE, COMMA, WHITESPACE, expr)));
    const array = series(LEFT_BRACKET, WHITESPACE, option(commaList(lazy(() => value))), WHITESPACE, RIGHT_BRACKET);

    // Objects
    const nameValuePair = series(string, WHITESPACE, COLON, WHITESPACE, lazy(() => value));
    const object = series(LEFT_BRACE, WHITESPACE, option(commaList(nameValuePair)), WHITESPACE, RIGHT_BRACE);

    // All Values and overall JSON strings
    const value = choice(NULL, TRUE, FALSE, number, string, array, object);
    const jsonText = expect('JSON', series(WHITESPACE, value, WHITESPACE, expect('end of string', not(char()))));


    try {
        let source = {text, len: text.length, pos: 0};
        let success = jsonText(source, (isMatch, startPos) => {
            if (!isMatch) return null;
            return text.slice(startPos, source.pos);
        });
        return success;
    }
    catch (err) {
        console.log(err);
    }

}
