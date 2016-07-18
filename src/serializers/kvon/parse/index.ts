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

function captureNull(src: Source) {
    expect(src, 'null', NULL);
    return null;
}

function captureBoolean(src: Source) {
    let c = src.text[src.pos];
    expect(src, 'boolean', JSON_BOOLEAN);
    return c === 't';
}

function captureNumber(src: Source) {
    return parseFloat(capture(src, 'number', JSON_NUMBER));
}

function captureString(src: Source) {
    return capture(src, 'string', JSON_STRING);
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
    if (c === 'n') return captureNull(src);
    if (c === 't' || c === 'f') return captureBoolean(src);
    if (c === '-' || (c >= '0' && c <= '9')) return captureNumber(src);
    if (c === '"') return captureString(src);
    if (c === '[') return captureArray(src);
    if (c === '{') return captureObject(src);
    throw new Error(`***`); // TODO: nice error message...
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

// JSON Boolean
const JSON_BOOLEAN = choice(TRUE, FALSE);

// JSON Number
const INTEGER_PART = choice(ZERO, DIGITS);
const FRACTIONAL_PART = option(series(DECIMAL, DIGITS));
const EXPONENT_PART = option(series(E, option(SIGN), DIGITS));
const JSON_NUMBER = series(option(MINUS), INTEGER_PART, FRACTIONAL_PART, EXPONENT_PART);

// JSON String
const UNESCAPED_CHAR = series(not(choice(QUOTATION_MARK, BACKSLASH, CONTROL_CHAR)), char());
const ESCAPED_CONTROL_CHAR = series(BACKSLASH, chars('"', '\\', '/', 'b', 'f', 'n', 'r', 't'));
const ESCAPED_UNICODE_CHAR = series(BACKSLASH, char('u'), HEX_DIGIT, HEX_DIGIT, HEX_DIGIT, HEX_DIGIT)
const ESCAPED_OR_UNESCAPED_CHAR = choice(UNESCAPED_CHAR, ESCAPED_CONTROL_CHAR, ESCAPED_UNICODE_CHAR);
const JSON_STRING = series(QUOTATION_MARK, zeroOrMore(ESCAPED_OR_UNESCAPED_CHAR), QUOTATION_MARK);

// JSON Array
const COMMA_LIST = (expr: Parser) => series(expr, zeroOrMore(series(WHITESPACE, COMMA, WHITESPACE, expr)));
const JSON_ARRAY = series(LEFT_BRACKET, WHITESPACE, option(COMMA_LIST(lazy(() => JSON_VALUE))), WHITESPACE, RIGHT_BRACKET);

// JSON Object
const NAME_VALUE_PAIR = series(JSON_STRING, WHITESPACE, COLON, WHITESPACE, lazy(() => JSON_VALUE));
const JSON_OBJECT = series(LEFT_BRACE, WHITESPACE, option(COMMA_LIST(NAME_VALUE_PAIR)), WHITESPACE, RIGHT_BRACE);

// Any JSON Value
const JSON_VALUE = choice(NULL, JSON_BOOLEAN, JSON_NUMBER, JSON_STRING, JSON_ARRAY, JSON_OBJECT);
