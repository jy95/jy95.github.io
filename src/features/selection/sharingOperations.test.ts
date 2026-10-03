import { expect, it } from 'vitest';
import { encodeBase64url, decodeBase64url } from './base64url';
import { entriesParameter } from './sharingQuery';
import { deserializeSelection } from './sharingJson';
import { emptySelection } from './documentTypes';
import { transportError } from './sharingErrors';

it('round-trips binary bytes with URL-safe base64 and no padding', () => {
    const bytes = Uint8Array.from([0, 255, 254, 128, 42]);
    const encoded = encodeBase64url(bytes);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeBase64url(encoded)).toEqual(bytes);
});
it('accepts only one valid entries parameter and ignores unrelated query keys', () => {
    expect(entriesParameter(new URLSearchParams('games=a'))).toBeNull();
    expect(entriesParameter(new URLSearchParams('entries=YWJj&games=a'))).toBe('YWJj');
    expect(() => entriesParameter(new URLSearchParams('entries=YWJj&entries=YWJj'))).toThrow('invalid');
    expect(() => entriesParameter(new URLSearchParams('entries=a'))).toThrow('invalid');
});
it('normalizes invalid UTF-8 and classifies unexpected transport errors', () => {
    expect(deserializeSelection(Uint8Array.from([0xff]))).toEqual(emptySelection());
    expect(transportError(new Error('compressionUnavailable'))).toBe('compressionUnavailable');
    expect(transportError(new Error('unexpected'))).toBe('invalid');
    expect(transportError(null)).toBe('invalid');
});
