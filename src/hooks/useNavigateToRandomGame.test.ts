// src/hooks/useNavigateToRandomGame.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const pushMock = vi.fn();

vi.mock('@/i18n/routing', () => ({
    useRouter: () => ({ push: pushMock }),
}));

import { useNavigateToRandomGame } from './useNavigateToRandomGame';

function jsonResponse(body: unknown, status = 200) {
    return Promise.resolve(
        new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
    );
}

describe('useNavigateToRandomGame', () => {
    beforeEach(() => {
        pushMock.mockReset();
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
        await act(async () => { await result.current.navigateToRandomGame(); });

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
        await act(async () => { await result.current.navigateToRandomGame(); });

        await waitFor(() => expect(pushMock).toHaveBeenCalledWith({
            pathname: '/video/[id]',
            params: { id: 'VID_B' },
        }));
    });

    it('keeps isPending true after a successful request while navigation takes over', async () => {
        let resolveFetch: (v: Response) => void = () => {};
        vi.stubGlobal('fetch', vi.fn().mockImplementation(
            () => new Promise((resolve) => { resolveFetch = resolve; })
        ));

        const { result } = renderHook(() => useNavigateToRandomGame());
        expect(result.current.isPending).toBe(false);

        // Start the request without returning its unresolved promise to act.
        act(() => { void result.current.navigateToRandomGame(); });
        expect(result.current.isPending).toBe(true);

        await act(async () => {
            resolveFetch(
                new Response(JSON.stringify({ identifier: 'X', type: 'VIDEO' }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                })
            );
        });

        expect(pushMock).toHaveBeenCalledWith({
            pathname: '/video/[id]',
            params: { id: 'X' },
        });
        expect(result.current.isPending).toBe(true);
    });

    it('ignores a second call while one is already pending', async () => {
        let resolveFetch: (response: Response) => void = () => {};
        const fetchMock = vi.fn(() => new Promise<Response>(resolve => { resolveFetch = resolve; }));
        vi.stubGlobal('fetch', fetchMock);

        const { result } = renderHook(() => useNavigateToRandomGame());
        // Start the request without returning its unresolved promise to act.
        act(() => { void result.current.navigateToRandomGame(); });
        expect(result.current.isPending).toBe(true);

        await act(async () => { await result.current.navigateToRandomGame(); });
        expect(fetchMock).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolveFetch(new Response(JSON.stringify({ identifier: 'X', type: 'VIDEO' })));
        });
        expect(pushMock).toHaveBeenCalledOnce();
    });

    it('does not push and resets isPending when the response is not ok', async () => {
        vi.stubGlobal('fetch', vi.fn().mockImplementation(() => jsonResponse({}, 500)));
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const { result } = renderHook(() => useNavigateToRandomGame());
        await act(async () => { await result.current.navigateToRandomGame(); });

        await waitFor(() => expect(result.current.isPending).toBe(false));
        expect(pushMock).not.toHaveBeenCalled();
        errSpy.mockRestore();
    });

    it('does not push and resets isPending when the response is not valid JSON', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('invalid JSON')));
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const { result } = renderHook(() => useNavigateToRandomGame());
        await act(async () => { await result.current.navigateToRandomGame(); });

        await waitFor(() => expect(result.current.isPending).toBe(false));
        expect(pushMock).not.toHaveBeenCalled();
        errSpy.mockRestore();
    });

    it('does not push when the fetch call itself rejects', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const { result } = renderHook(() => useNavigateToRandomGame());
        await act(async () => { await result.current.navigateToRandomGame(); });

        await waitFor(() => expect(result.current.isPending).toBe(false));
        expect(pushMock).not.toHaveBeenCalled();
        errSpy.mockRestore();
    });

    it('resets isPending when navigation throws', async () => {
        vi.stubGlobal('fetch', vi.fn(() => jsonResponse({ identifier: 'X', type: 'VIDEO' })));
        const error = new Error('navigation failed');
        pushMock.mockImplementationOnce(() => { throw error; });
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const { result } = renderHook(() => useNavigateToRandomGame());
        await act(async () => { await result.current.navigateToRandomGame(); });

        expect(result.current.isPending).toBe(false);
        expect(errSpy).toHaveBeenCalledWith('Failed to navigate to a random game:', error);
    });

    it('allows another request after a failed request', async () => {
        const fetchMock = vi.fn()
            .mockRejectedValueOnce(new Error('network down'))
            .mockImplementationOnce(() => jsonResponse({ identifier: 'retry', type: 'VIDEO' }));
        vi.stubGlobal('fetch', fetchMock);
        vi.spyOn(console, 'error').mockImplementation(() => {});

        const { result } = renderHook(() => useNavigateToRandomGame());
        await act(async () => { await result.current.navigateToRandomGame(); });
        expect(result.current.isPending).toBe(false);
        expect(pushMock).not.toHaveBeenCalled();

        await act(async () => { await result.current.navigateToRandomGame(); });
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(pushMock).toHaveBeenCalledExactlyOnceWith({
            pathname: '/video/[id]',
            params: { id: 'retry' },
        });
        expect(result.current.isPending).toBe(true);
    });
});
