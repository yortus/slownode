




// TODO: ...
export default function makeReference(path: string[]): string {
    let safePath = path.map(seg => JSON.stringify(seg).slice(1, -1).replace(/\./g, '\\u002e'));
    return '"' + ['^'].concat(safePath).join('.') + '"';
}
