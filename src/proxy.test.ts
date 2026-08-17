import { describe, it, expect, vi, beforeEach } from 'vitest';

const { createServerClientMock } = vi.hoisted(() => ({
    createServerClientMock: vi.fn(),
}));

vi.mock('@supabase/ssr', () => ({
    createServerClient: createServerClientMock,
}));

// Lightweight fake cookie jar + NextResponse mimicking next/server's shape
// closely enough for proxy.ts's usage (request.cookies.getAll/set,
// response.cookies.set, NextResponse.next({ request })). This avoids
// pulling in the real next/server edge runtime machinery in a jsdom test.
function makeCookieJar(initial: Record<string, string> = {}) {
    const store = new Map<string, string>();
    for (const [name, value] of Object.entries(initial)) store.set(name, value);
    return {
        getAll: () => Array.from(store.entries()).map(([name, value]) => ({ name, value })),
        get: (name: string) => (store.has(name) ? { name, value: store.get(name)! } : undefined),
        set: (name: string, value: string) => {
            store.set(name, value);
        },
    };
}

vi.mock('next/server', () => {
    class FakeNextResponse {
        cookies: ReturnType<typeof makeCookieJar>;
        constructor() {
            this.cookies = makeCookieJar();
        }
        static next(_init?: unknown) {
            return new FakeNextResponse();
        }
    }
    return { NextResponse: FakeNextResponse };
});

import { updateSession } from './lib/supabase/proxy';

function makeRequest(cookies: Record<string, string> = {}) {
    return { cookies: makeCookieJar(cookies) } as any;
}

describe('updateSession', () => {
    beforeEach(() => {
        createServerClientMock.mockReset();
    });

    it('calls supabase.auth.getClaims to refresh the session', async () => {
        const getClaims = vi.fn().mockResolvedValue({ data: null, error: null });
        createServerClientMock.mockReturnValue({ auth: { getClaims } });

        await updateSession(makeRequest());

        expect(getClaims).toHaveBeenCalledTimes(1);
    });

    it("exposes a getAll() cookie reader backed by the request's cookies", async () => {
        let capturedCookies: any;
        createServerClientMock.mockImplementation((_url: string, _key: string, options: any) => {
            capturedCookies = options.cookies;
            return { auth: { getClaims: vi.fn().mockResolvedValue({}) } };
        });

        const request = makeRequest({ 'sb-token': 'abc' });
        await updateSession(request);

        expect(capturedCookies.getAll()).toEqual([{ name: 'sb-token', value: 'abc' }]);
    });

    it('writes cookies passed to setAll onto both the request and the returned response', async () => {
        let capturedCookies: any;
        createServerClientMock.mockImplementation((_url: string, _key: string, options: any) => {
            capturedCookies = options.cookies;
            return {
                auth: {
                    getClaims: vi.fn().mockImplementation(async () => {
                        capturedCookies.setAll([{ name: 'sb-access-token', value: 'newvalue', options: {} }]);
                        return {};
                    }),
                },
            };
        });

        const request = makeRequest();
        const result = await updateSession(request);

        expect(request.cookies.get('sb-access-token')?.value).toBe('newvalue');
        expect(result.cookies.get('sb-access-token')?.value).toBe('newvalue');
    });

    it('applies every cookie from a single setAll call, not just the first', async () => {
        let capturedCookies: any;
        createServerClientMock.mockImplementation((_url: string, _key: string, options: any) => {
            capturedCookies = options.cookies;
            return {
                auth: {
                    getClaims: vi.fn().mockImplementation(async () => {
                        capturedCookies.setAll([
                            { name: 'a', value: '1', options: {} },
                            { name: 'b', value: '2', options: {} },
                        ]);
                        return {};
                    }),
                },
            };
        });

        const result = await updateSession(makeRequest());

        expect(result.cookies.get('a')?.value).toBe('1');
        expect(result.cookies.get('b')?.value).toBe('2');
    });

    it('returns an empty-cookie response when the session refresh sets nothing', async () => {
        createServerClientMock.mockReturnValue({ auth: { getClaims: vi.fn().mockResolvedValue({}) } });

        const result = await updateSession(makeRequest());

        expect(result.cookies.getAll()).toEqual([]);
    });

    it('reflects cookies already present on the request before any setAll call', async () => {
        let capturedCookies: any;
        createServerClientMock.mockImplementation((_url: string, _key: string, options: any) => {
            capturedCookies = options.cookies;
            return { auth: { getClaims: vi.fn().mockResolvedValue({}) } };
        });

        await updateSession(makeRequest({ existing: 'value' }));

        expect(capturedCookies.getAll()).toContainEqual({ name: 'existing', value: 'value' });
    });
});
