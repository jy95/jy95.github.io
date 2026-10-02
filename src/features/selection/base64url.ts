export function encodeBase64url(bytes: Uint8Array): string {
    return btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeBase64url(encoded: string): Uint8Array<ArrayBuffer> {
    const binary = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(binary, char => char.charCodeAt(0));
}
