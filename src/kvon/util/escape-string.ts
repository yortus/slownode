




/** Accepts a string literal, and returns the equivalent JSON-encoded text for it. */
export default function escapeString(s: string): string {
    let result = '"';

    // Scan the string literal character-by-character.
    for (let i = 0, len = s.length; i < len; ++i) {
        let code = s.charCodeAt(i);

        // Handle control characters with special escape sequences.
        switch (code) {
            case 0x0022: result += '\\"'; continue;
            case 0x005c: result += '\\\\'; continue;
            case 0x0008: result += '\\b'; continue;
            case 0x000c: result += '\\f'; continue;
            case 0x000a: result += '\\n'; continue;
            case 0x000d: result += '\\r'; continue;
            case 0x0009: result += '\\t'; continue;
            case 0x007f: result += '\\u007f'; continue;
        }

        // Handle all other control characters.
        if (code <= 0x001f || (code >= 0x0080 && code <= 0x009f)) {
            let hex = code.toString(16);
            result += `\\u` + '0'.repeat(4 - hex.length) + hex;
            continue;
        }

        // Handle ordinary characters that don't need escaping.
        result += s[i];
    }
    result += '"';
    return result;
}
