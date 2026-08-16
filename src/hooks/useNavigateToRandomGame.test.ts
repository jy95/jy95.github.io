// src/hooks/useNavigateToRandomGame.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const pushMock = vi.fn();
let currentLocale = 'en';

vi.mock('@/i18n/routing', () => ({
    useRouter: () => ({ push: pushMock }),
    usePathname: () => '/games/random',
}));

vi.mock('next-intl', () => ({
    useLocale: () => currentLocale,
}));

import { useNavigateToRandomGame } from './useNavigateToRandomGame';

function jsonResponse(body: unknown, ok = true, status = 200) {
    return Promise.resolve(
        new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
    ).then((r) => Object.assign(r, { ok }));
}

describe('useNavigateToRandomGame', () => {
    beforeEach(() => {
        pushMock.mockReset();
        currentLocale = 'en';
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('pushes to the playlist route when a PLAYLIST answer is returned', async () => {
        vi.stubGlobal('fetch', vi.fn().mockImplementation(() =>
            jsonResponse({ identifier: 'PL_A', type: 'PLAYLIST' })
        ));

        const { result } = renderHook(() => useNavigateToRandomGame());
        act(() => result.current.navigateToRandomGame());

        await waitFor(() => expect(pushMock).toHaveBeenCalledWith({
            pathname: '/playlist/[id]',
            params: { id: 'PL_A' },
        }));
    });

    it('pushes to the video route when a VIDEO answer is returned', async () => {
        vi.stubGlobal('fetch', vi.fn().mockImplementation(() =>
            jsonResponse({ identifier: 'VID_B', type: 'VIDEO' })
        ));

        const { result } = renderHook(() => useNavigateToRandomGame());
        act(() => result.current.navigateToRandomGame());

        await waitFor(() => expect(pushMock).toHaveBeenCalledWith({
            pathname: '/video/[id]',
            params: { id: 'VID_B' },
        }));
    });

    it('sets isPending true while the request is in flight, then false', async () => {
        let resolveFetch: (v: Response) => void = () => {};
        vi.stubGlobal('fetch', vi.fn().mockImplementation(
            () => new Promise((resolve) => { resolveFetch = resolve; })
        ));

        const { result } = renderHook(() => useNavigateToRandomGame());
        expect(result.current.isPending).toBe(false);

        act(() => result.current.navigateToRandomGame());
        await waitFor(() => expect(result.current.isPending).toBe(true));

        act(() => {
            resolveFetch(Object.assign(
                new Response(JSON.stringify({ identifier: 'X', type: 'VIDEO' })),
                { ok: true }
            ));
        });

        await waitFor(() => expect(result.current.isPending).toBe(false));
    });

    it('ignores a second call while one is already pending', async () => {
        const fetchMock = vi.fn().mockImplementation(() => new Promise(() => {})); // never resolves
        vi.stubGlobal('fetch', fetchMock);

        const { result } = renderHook(() => useNavigateToRandomGame());
        act(() => result.current.navigateToRandomGame());
        await waitFor(() => expect(result.current.isPending).toBe(true));

        act(() => result.current.navigateToRandomGame());
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('does not push and resets isPending when the response is not ok', async () => {
        vi.stubGlobal('fetch', vi.fn().mockImplementation(() => jsonResponse({}, false, 500)));
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const { result } = renderHook(() => useNavigateToRandomGame());
        act(() => result.current.navigateToRandomGame());

        await waitFor(() => expect(result.current.isPending).toBe(false));
        expect(pushMock).not.toHaveBeenCalled();
        errSpy.mockRestore();
    });

    it('does not push when the payload is malformed (fails isRandomAnswer)', async () => {
        vi.stubGlobal('fetch', vi.fn().mockImplementation(() => jsonResponse({ foo: 'bar' })));
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const { result } = renderHook(() => useNavigateToRandomGame());
        act(() => result.current.navigateToRandomGame());

        await waitFor(() => expect(result.current.isPending).toBe(false));
        expect(pushMock).not.toHaveBeenCalled();
        errSpy.mockRestore();
    });

    it('does not push when the fetch call itself rejects', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const { result } = renderHook(() => useNavigateToRandomGame());
        act(() => result.current.navigateToRandomGame());

        await waitFor(() => expect(result.current.isPending).toBe(false));
        expect(pushMock).not.toHaveBeenCalled();
        errSpy.mockRestore();
    });
});
