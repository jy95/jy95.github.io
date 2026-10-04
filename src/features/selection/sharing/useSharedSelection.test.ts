import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { emptySelection } from '@/domain/selection/operations';
import type { SelectionDocument } from '@/domain/selection/types';
import * as sharing from './sharing';
import { useSharedSelection } from './useSharedSelection';

const document = { ...emptySelection(), games: ['missing'] };

function pendingDecode() {
    let resolve!: (document: SelectionDocument | null) => void;
    const promise = new Promise<SelectionDocument | null>(done => { resolve = done; });
    return { promise, resolve };
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('exposes none, loading, ready and error states without writing personal storage', async () => {
    const pending = pendingDecode();
    const decode = vi.spyOn(sharing, 'decodeSelection').mockReturnValueOnce(pending.promise).mockResolvedValueOnce(null);
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const { result, rerender } = renderHook(({ param }: { param: string | null }) => useSharedSelection(param), { initialProps: { param: null as string | null } });
    expect(result.current).toEqual({ status: 'none' });
    expect(decode).not.toHaveBeenCalled();
    rerender({ param: 'shared' });
    expect(result.current).toEqual({ status: 'loading' });
    await act(async () => pending.resolve(document));
    expect(result.current).toEqual({ status: 'ready', document });
    rerender({ param: 'invalid' });
    expect(result.current).toEqual({ status: 'loading' });
    await waitFor(() => expect(result.current).toEqual({ status: 'error' }));
    rerender({ param: null });
    expect(result.current).toEqual({ status: 'none' });
    expect(write).not.toHaveBeenCalled();
});

it.each([document, null])('ignores stale decoding after leaving shared mode (%j)', async decoded => {
    const pending = pendingDecode();
    vi.spyOn(sharing, 'decodeSelection').mockReturnValue(pending.promise);
    const { result, rerender } = renderHook(({ param }: { param: string | null }) => useSharedSelection(param), { initialProps: { param: 'pending' as string | null } });
    expect(result.current).toEqual({ status: 'loading' });
    rerender({ param: null });
    await act(async () => pending.resolve(decoded));
    expect(result.current).toEqual({ status: 'none' });
});

it.each([document, null])('ignores pending decoding after unmount (%j)', async decoded => {
    const pending = pendingDecode();
    vi.spyOn(sharing, 'decodeSelection').mockReturnValue(pending.promise);
    const renderState = vi.fn();
    const { result, unmount } = renderHook(() => {
        const state = useSharedSelection('pending');
        renderState(state);
        return state;
    });
    expect(result.current).toEqual({ status: 'loading' });
    unmount();
    const renderCount = renderState.mock.calls.length;
    await act(async () => pending.resolve(decoded));
    expect(renderState).toHaveBeenCalledTimes(renderCount);
    expect(result.current).toEqual({ status: 'loading' });
});
