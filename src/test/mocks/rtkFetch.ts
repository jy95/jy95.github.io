import { vi } from 'vitest';

export function stubRtkFetch() {
    vi.stubGlobal('location', new URL('http://localhost'));
    const NativeRequest = globalThis.Request;
    vi.stubGlobal(
        'Request',
        class extends NativeRequest {
            constructor(input: RequestInfo | URL, init?: RequestInit) {
                super(typeof input === 'string' ? new URL(input, globalThis.location.href).toString() : input, init);
            }
        }
    );
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

export function calledUrl(fetchMock: ReturnType<typeof vi.fn>, callIndex = 0): URL {
    const raw = fetchMock.mock.calls[callIndex][0];
    const urlStr = typeof raw === 'string' ? raw : raw.url;
    return new URL(urlStr, 'http://localhost');
}