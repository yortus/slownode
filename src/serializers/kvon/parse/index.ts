import Reviver from './reviver';
export {Reviver};
import {series, choice, option, zeroOrMore, oneOrMore, not, char, chars, lazy} from './parser-combinators';
import {Source, Parser} from './parser-combinators';





// TODO: implement parse...
export default function parse(text: string, reviver?: Reviver): {} {

    // TODO: ...
    try {
        // TODO:
        // - strings are not yet 'unescaped', and special ^ and $ need special handling
        // - add up work hours from git log
        let source = {text, len: text.length, pos: 0};
        WHITESPACE(source);
        let result = captureValue(source);
        WHITESPACE(source);
        expect(source, 'End of text', EOS);
        return result;
    }
    catch (err) {
        console.log(err);
    }

}





function expect(src: Source, expected: string, expr: Parser) {
    if (expr(src)) return;
    let before = (src.pos > 10 ? '...' : '') + src.text.slice(src.pos - 10, src.pos);
    let after = src.text.slice(src.pos + 1, src.pos + 11) + (src.len - src.pos > 11 ? '...' : '');
    let indicator = `${before}-->${src.text[src.pos]}<--${after}`;
    throw new Error(`KVON: expected ${expected} but found '${src.text[src.pos]}': "${indicator}"`);
}

function capture(src: Source, expected: string, expr: Parser) {
    let startPos = src.pos;
    expect(src, expected, expr);
    let result = src.text.slice(startPos, src.pos);
    return result;
}

function captureNumber(src: Source) {
    return parseFloat(capture(src, 'number', number));
}

function captureString(src: Source) {
    return capture(src, 'string', string);
}

function captureArray(src: Source) {
    expect(src, '[', LEFT_BRACKET);
    WHITESPACE(src);
    let result = [];
    while (true) {
        if (RIGHT_BRACKET(src)) return result;
        result.push(captureValue(src));
        WHITESPACE(src);
        COMMA(src);
        WHITESPACE(src);
    }
}

function captureObject(src: Source) {
    expect(src, '{', LEFT_BRACE);
    WHITESPACE(src);
    let result = {};
    while (true) {
        if (RIGHT_BRACE(src)) return result;
        let name = captureString(src);
        WHITESPACE(src);
        expect(src, 'colon', COLON);
        WHITESPACE(src);
        let value = captureValue(src);
        result[name] = value;
        WHITESPACE(src);
        COMMA(src);
        WHITESPACE(src);
    }
}

function captureValue(src: Source): boolean | string | number | {} | any[] {
    let c = src.text[src.pos];
    switch (c) {
        case 'n':
            expect(src, 'null', NULL);
            return null;
        case 't':
            expect(src, 'true', TRUE);
            return true;
        case 'f':
            expect(src, 'false', FALSE);
            return false;
        case '-':
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            return captureNumber(src);
        case '"':
            return captureString(src);
        case '[':
            return captureArray(src);
        case '{':
            return captureObject(src);
        default:
            // TODO: nice error message...
            throw new Error(`***`);
    }
}





// JSON parsers...
// Terminals
const BACKSLASH = char('\\');
const COLON = char(':');
const COMMA = char(',');
const CONTROL_CHAR = char('\u0000', '\u001f');
const DECIMAL = char('.');
const DIGITS = oneOrMore(char('0', '9'));
const E = choice(char('e'), char('E'));
const EOS = not(char());
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
// TODO: unused - remove these
const value = choice(NULL, TRUE, FALSE, number, string, array, object);
const jsonText = series(WHITESPACE, value, WHITESPACE, not(char()));
