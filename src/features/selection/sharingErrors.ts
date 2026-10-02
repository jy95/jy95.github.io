export type SelectionTransportError = 'invalid' | 'compressionUnavailable' | 'tooLarge';

export function transportError(error: unknown): SelectionTransportError {
    const message = error instanceof Error ? error.message : '';
    if (message === 'compressionUnavailable' || message === 'tooLarge') return message;
    return 'invalid';
}
