




/**
 * Computes the 'reference' string corresponding to the given list of property names, which
 * represent a path to a specific node in an object graph. Reference strings have the form
 * "^propName1.propName2.propName3[...]". Occurences of the special characters '^' and '.'
 * are escaped within the property names themselves (where necessary), so that every
 * reference string maps unambiguously back to a unique path.
 */
export default function makeReference(path: string[]): string {
    let safePath = path.map(seg => JSON.stringify(seg).slice(1, -1).replace(/\./g, '\\u002e'));
    return '"' + ['^'].concat(safePath).join('.') + '"';
}
