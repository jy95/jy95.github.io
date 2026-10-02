export function selectionParameter(params: URLSearchParams): string | null {
    if (!params.has('selection')) return null;
    const values = params.getAll('selection');
    const encoded = values[0];
    if (values.length !== 1 || !encoded || !/^[A-Za-z0-9_-]+$/.test(encoded) || encoded.length % 4 === 1) throw new Error('invalid');
    return encoded;
}
