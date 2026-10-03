/** Read-only query access shared by Next.js and native URLSearchParams. */
export interface SelectionSearchParams {
    getAll(name: string): string[];
}

export function entriesParameter(params: SelectionSearchParams): string | null {
    const values = params.getAll('entries');
    if (values.length === 0) return null;
    const encoded = values[0];
    if (values.length !== 1 || !encoded || !/^[A-Za-z0-9_-]+$/.test(encoded) || encoded.length % 4 === 1) throw new Error('invalid');
    return encoded;
}
