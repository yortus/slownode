




/** Accepts the JSON-encoded text for a string literal, and returns the string literal that it represents. */
export default function unescapeString(jsonText: string): string {
    let result = '';

    // Scan the JSON text character-by-character, skipping the delimiters.
    let i = 1, len = jsonText.length - 1;
    while (i < len) {
        let c = jsonText[i++];

        // Handle non-escaped characters.
        if (c !== '\\') {
            result += c;
            continue;
        }

        // Handle escape sequences, including unicode escapes.
        c = jsonText[i++];
        switch (c) {
            case '"': result += '"'; break;
            case '\\': result += '\\'; break;
            case '/': result += '/'; break;
            case 'b': result += '\b'; break;
            case 'f': result += '\f'; break;
            case 'n': result += '\n'; break;
            case 'r': result += '\r'; break;
            case 't': result += '\t'; break;
            case 'u': result += String.fromCharCode(parseInt(jsonText.slice(i, i += 4), 16)); break;
            default: result += c;
        }
    }
    return result;
}
