import { StrictMode } from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('@/i18n/routing', () => ({ useRouter: () => ({ push: navigation.push }) }));

import Random from './PageClient';

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    navigation.push.mockReset();
});

it.each(['success', 'failure'])('automatically navigates once across StrictMode replay and %s rerenders', async mode => {
    const fetchMock = vi.fn();
    let complete: (response: Response) => void = () => {};
    fetchMock.mockImplementation(() => new Promise<Response>(resolve => { complete = resolve; }));
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(<StrictMode><Random /></StrictMode>);
    expect(fetchMock).toHaveBeenCalledOnce();
    rerender(<StrictMode><Random /></StrictMode>);
    await act(async () => {
        complete(new Response(JSON.stringify({ type: 'VIDEO', identifier: 'video' }), { status: mode === 'success' ? 200 : 500 }));
    });
    await waitFor(() => expect(navigation.push).toHaveBeenCalledTimes(mode === 'success' ? 1 : 0));
    // next-intl may provide a new navigation function when its context changes.
    navigation.push = vi.fn();
    rerender(<StrictMode><Random /></StrictMode>);
    expect(fetchMock).toHaveBeenCalledOnce();
});
