/**
 * Encodes a Uint8Array buffer into a URL-safe Base64 string (RFC 4648 §5).
 * Omits padding characters ('=') and replaces '+' with '-' and '/' with '_'.
 */
export const toBase64Url = (bytes: Uint8Array): string =>
  btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

/**
 * Decodes a URL-safe Base64 string back into a Uint8Array.
 * Validates character sets and padding rules before decoding.
 * 
 * @throws {Error} Throws 'invalid' if the input string contains invalid characters
 *                 or has an illegal Base64 length (modulus 4 === 1).
 */
export function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  // Validate URL-safe Base64 characters and illegal length (a valid Base64 string never has length % 4 === 1)
  if (!/^[A-Za-z0-9_-]+$/.test(text) || text.length % 4 === 1) {
    throw new Error('invalid');
  }

  // Restore standard Base64 characters and missing '=' padding
  const base64 = text.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

  const bytes = Uint8Array.from(atob(padded), c => c.charCodeAt(0));
  if (toBase64Url(bytes) !== text) throw new Error('invalid');
  return bytes;
}
