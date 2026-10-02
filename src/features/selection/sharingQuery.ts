export const MAX_ENCODED_SIZE = 64 * 1024;

export function selectionParameter(params: URLSearchParams): string | null {
    if (!params.has('selection')) return null;
    const values = params.getAll('selection');
    const encoded = values[0];
    if (encoded.length > MAX_ENCODED_SIZE) throw new Error('tooLarge');
    if (values.length !== 1 || !encoded || !/^[A-Za-z0-9_-]+$/.test(encoded) || encoded.length % 4 === 1) throw new Error('invalid');
    return encoded;
}
