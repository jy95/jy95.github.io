export type SelectionTransportError = 'invalid' | 'unsupported' | 'compressionUnavailable' | 'tooLarge';

export function transportError(error: unknown): SelectionTransportError {
    const message = error instanceof Error ? error.message : '';
    if (message === 'unsupported' || message === 'compressionUnavailable' || message === 'tooLarge') return message;
    return 'invalid';
}
