import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useSharedSelection } from './useSharedSelection';
import { useSelectionShare } from './useSelectionShare';
import { emptySelection } from './documentTypes';
import * as sharing from './sharing';

vi.mock('@/i18n/routing', () => ({ getPathname: ({ locale }: { locale: string }) => `/${locale}/selection` }));
afterEach(() => vi.restoreAllMocks());

it('invalidates decoding when a shared query becomes personal', async () => {
    let resolve!: (value: sharing.SharedSelection) => void;
    vi.spyOn(sharing, 'parseSharedSelection').mockReturnValue(new Promise(done => { resolve = done; }));
    const { result, rerender } = renderHook(({ query }) => useSharedSelection(query), { initialProps: { query: 'selection=pending' } });
    expect(result.current.kind).toBe('processing');
    rerender({ query: 'games=ignored' });
    expect(result.current.kind).toBe('absent');
    await act(async () => resolve({ kind: 'error', error: 'invalid' }));
    expect(result.current.kind).toBe('absent');
});
it('classifies decode rejections and ignores completion after unmount', async () => {
    const decode = vi.spyOn(sharing, 'parseSharedSelection').mockRejectedValue(new Error('tooLarge'));
    const first = renderHook(() => useSharedSelection('selection=pending'));
    await waitFor(() => expect(first.result.current).toEqual({ kind: 'error', error: 'tooLarge' }));
    first.unmount();
    let resolve!: (value: sharing.SharedSelection) => void;
    decode.mockReturnValue(new Promise(done => { resolve = done; }));
    const second = renderHook(() => useSharedSelection('selection=pending'));
    second.unmount();
    await act(async () => resolve({ kind: 'selection', document: emptySelection() }));
    expect(second.result.current.kind).toBe('processing');
});
it('lets the newest encode win and invalidates a closed request', async () => {
    let resolve!: (query: string) => void;
    vi.spyOn(sharing, 'selectionQuery').mockImplementationOnce(() => new Promise(done => { resolve = done; })).mockResolvedValue('selection=new');
    const { result } = renderHook(() => useSelectionShare('', 'en'));
    let pending!: Promise<void>;
    act(() => { pending = result.current.share(emptySelection()); });
    expect(result.current.state.kind).toBe('processing');
    await act(async () => { await result.current.share(emptySelection()); });
    expect(result.current.state).toMatchObject({ kind: 'ready', url: expect.stringContaining('/en/selection?selection=new') });
    act(() => result.current.close());
    await act(async () => { resolve('selection=old'); await pending; });
    expect(result.current.state.kind).toBe('idle');
});

it('invalidates encoding when the locale changes', async () => {
    let resolve!: (query: string) => void;
    vi.spyOn(sharing, 'selectionQuery').mockReturnValue(new Promise(done => { resolve = done; }));
    const { result, rerender } = renderHook(({ locale }: { locale: 'en' | 'fr' }) => useSelectionShare('', locale), { initialProps: { locale: 'en' } });
    let pending!: Promise<void>;
    act(() => { pending = result.current.share(emptySelection()); });
    rerender({ locale: 'fr' });
    expect(result.current.state.kind).toBe('idle');
    await act(async () => { resolve('selection=old'); await pending; });
    expect(result.current.state.kind).toBe('idle');
});
