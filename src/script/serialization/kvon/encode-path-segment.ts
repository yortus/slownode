




export default function encodePathSegment(pathSegment: string): string {
    return JSON.stringify(pathSegment).slice(1, -1).replace(/\./g, '\\u002e');
}
