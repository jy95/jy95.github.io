export type SelectionTransportError = 'invalid' | 'compressionUnavailable';

export function transportError(error: unknown): SelectionTransportError {
    const message = error instanceof Error ? error.message : '';
    if (message === 'compressionUnavailable') return message;
    return 'invalid';
}
