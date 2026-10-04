import { fromBase64Url, toBase64Url } from './encoding';

it('round trips every byte using canonical unpadded Base64 URL encoding', () => {
    const bytes = Uint8Array.from({ length: 256 }, (_, index) => index);
    const encoded = toBase64Url(bytes);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(fromBase64Url(encoded)).toEqual(bytes);
});

it.each(['', '!!!', 'A', 'Zg=', 'Zg==', 'Z g', '+w', '/w', 'Zh', 'Zm9'])('rejects invalid or noncanonical Base64 URL input %s', text => {
    expect(() => fromBase64Url(text)).toThrow('invalid');
});
