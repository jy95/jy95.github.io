export const toBase64Url = (bytes: Uint8Array<ArrayBuffer>): string =>
    btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''))
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replace(/=+$/, '');

export function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
    if (!/^[A-Za-z0-9_-]+$/.test(text) || text.length % 4 === 1) throw new Error('invalid');
    const bytes = Uint8Array.from(atob(text.replaceAll('-', '+').replaceAll('_', '/')), char => char.charCodeAt(0));
    if (toBase64Url(bytes) !== text) throw new Error('invalid');
    return bytes;
}
