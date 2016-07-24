import makeReference from './make-reference';
import Reviver from './reviver';
export {Reviver};
import {series, choice, option, zeroOrMore, oneOrMore, not, char, chars, lazy} from './parser-combinators';
import {Source, Parser} from './parser-combinators';





// TODO: implement parse...
// TODO: reviver: accept Reviver | Reviver[]
export default function parse(text: string, reviver?: Reviver): {} {

    // TODO: ...
    let compositeReviver: Reviver;
    if (!reviver) {
        compositeReviver = (k, v) => v;
    }
    else if (typeof reviver === 'function') {
        compositeReviver = function (this, key, val) {
            // TODO: swap call order below? which order is correct/consistent? examples?
            let newVal = reviver.call(this, key, val);
            //if (Object.is(val, newVal)) newVal = tranformers.reviver.call(this, key, val);
            return newVal;
        }
    }
    else {
        // TODO: JSON reviver may *only* be a function, so this error is correct (but needs finalizing)
        throw new Error(`Bad arg`);
    }

    // TODO: ...
    try {
        // TODO:
        // - strings are not yet 'unescaped', and special ^ and $ need special handling
        // - add up work hours from git log
        let source = {text, len: text.length, pos: 0};
        let visited = new Map<string, {}>();
        WHITESPACE(source);
        let result = temp(source, [], compositeReviver, visited);
        WHITESPACE(source);
        match(source, 'End of text', EOS);
        return result;
    }
    catch (err) {
        console.log(err);
    }
}





function temp(src: Source, path: string[], reviver: Reviver, visited: Map<string, {}>): {} {
    let result: {};
    let c = src.text[src.pos];

    // Handle null.
    if (c === 'n') {
        match(src, 'null', NULL);
        result = null;
    }

    // Handle booleans.
    else if (c === 't' || c === 'f') {
        match(src, 'boolean', JSON_BOOLEAN);
        result = c === 't';
    }

    // Handle numbers.
    else if (c === '-' || (c >= '0' && c <= '9')) {
        result = parseFloat(capture(src, 'number', JSON_NUMBER));
    }

    // Handle strings, including references.
    else if (c === '"') {
        // TODO: unescape... eg \n \r \u0032 etc...
        let rawString = capture(src, 'string', JSON_STRING);
        if (rawString[1] === '^') {
            // TODO: reference
            if (!visited.has(rawString)) throw new Error(`(KVON) invalid reference`); // TODO: improve message...
            result = visited.get(rawString);
        }
        else {
            result = unescape(rawString);
        }
    }

    // Handle arrays.
    else if (c === '[') {
        let ar = [];
        match(src, '[', LEFT_BRACKET);
        WHITESPACE(src);
        while (src.text[src.pos] !== ']') {
            let element = temp(src, path.concat(ar.length.toString()), reviver, visited); // NB: recursive
            ar.push(element);
            WHITESPACE(src);
            if (!COMMA(src)) break;
            WHITESPACE(src);
        }
        match(src, ']', RIGHT_BRACKET);
        result = ar;
    }

    // Handle objects.
    else if (c === '{') {
        let obj = {}, isDiscriminated = false;
        match(src, '{', LEFT_BRACE);
        WHITESPACE(src);
        while (src.text[src.pos] !== '}') {
            let rawName = capture(src, 'string', JSON_STRING);
            isDiscriminated = isDiscriminated || rawName === '"$"';
            let name = unescape(rawName);
            WHITESPACE(src);
            match(src, 'colon', COLON);
            WHITESPACE(src);
            let value = temp(src, path.concat(name), reviver, visited); // NB: recursive
            obj[name] = value;
            WHITESPACE(src);
            if (!COMMA(src)) break;
            WHITESPACE(src);
        }
        match(src, '}', RIGHT_BRACE);
        if (isDiscriminated) {
            // TODO: run reviver... this is the only case... explain why here, and document reviver rules in README...
            obj = reviver.call({'':obj}, '', obj); // TODO: throwaway object created every time here... reduce waste?
        }
        result = obj;
    }

    else {
        // TODO: the following is sure to throw since we've covered all valid options already...
        match(src, `null, boolean, string, number, array or object`, JSON_VALUE);
    }

    // TODO: update visited...
    visited.set(makeReference(path), result);
    return result;
}





// TODO: ...
function capture(src: Source, expected: string, expr: Parser) {
    let startPos = src.pos;
    match(src, expected, expr);
    let result = src.text.slice(startPos, src.pos);
    return result;
}





// TODO: ...
function match(src: Source, expected: string, expr: Parser) {
    if (expr(src)) return;
    let before = (src.pos > 10 ? '...' : '') + src.text.slice(src.pos - 10, src.pos);
    let after = src.text.slice(src.pos + 1, src.pos + 11) + (src.len - src.pos > 11 ? '...' : '');
    let indicator = `${before}-->${src.text[src.pos]}<--${after}`;
    throw new Error(`(KVON) expected ${expected} but found '${src.text[src.pos]}': "${indicator}"`);
}





// TODO: ...
function unescape(raw: string): string {
    // TODO: implement without JSON.parse?
    return JSON.parse(raw);
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
