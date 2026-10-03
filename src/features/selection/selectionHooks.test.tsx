import { resolvePageSelection } from './useSelectionCatalogue';
import type { SelectionEntry } from './catalogue';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useSharedSelection } from './useSharedSelection';
import { useSelectionShare } from './useSelectionShare';
import { emptySelection } from './documentTypes';
import * as sharing from './sharing';

vi.mock('next-intl', () => ({
    useLocale: vi.fn().mockReturnValue('en'),
}));

vi.mock('@/i18n/routing', () => ({
    getPathname: ({ locale }: { locale: string }) => `/${locale}/selection`,
}));

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

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

it('classifies decode rejections', async () => {
    vi.spyOn(sharing, 'parseSharedSelection').mockRejectedValue(new Error('compressionUnavailable'));
    const { result } = renderHook(() => useSharedSelection('selection=pending'));
    await waitFor(() => expect(result.current).toEqual({ kind: 'error', error: 'compressionUnavailable' }));
});

it('ignores decode completion after unmount', async () => {
    let resolve!: (value: sharing.SharedSelection) => void;
    vi.spyOn(sharing, 'parseSharedSelection').mockReturnValue(new Promise(done => { resolve = done; }));
    const { result, unmount } = renderHook(() => useSharedSelection('selection=pending'));
    unmount();
    await act(async () => resolve({ kind: 'selection', document: emptySelection() }));
    expect(result.current.kind).toBe('processing');
});

it('lets the newest encode win and invalidates a closed request', async () => {
    let resolve!: (query: string) => void;
    vi.spyOn(sharing, 'selectionQuery')
        .mockImplementationOnce(() => new Promise(done => { resolve = done; }))
        .mockResolvedValue('selection=new');
    const { result } = renderHook(() => useSelectionShare(true));
    let pending!: Promise<void>;
    act(() => { pending = result.current.share(emptySelection()); });
    expect(result.current.state.kind).toBe('processing');
    await act(async () => { await result.current.share(emptySelection()); });
    expect(result.current.state).toMatchObject({ kind: 'ready', url: expect.stringContaining('/en/selection?selection=new') });
    act(() => result.current.close());
    await act(async () => { resolve('selection=old'); await pending; });
    expect(result.current.state.kind).toBe('idle');
});

it('resolves personal, categorized shared, and pending selections without changing inputs', () => {
    const entry: SelectionEntry = { selectionId: 'a', category: 'games', source: 'published', game: { id: 'a', title: 'Alpha', imagePath: '/a.webp', url_type: 'VIDEO', url: 'https://youtube.com' } };
    const catalogue = [entry];
    const document = { ...emptySelection(), games: ['a', 'missing'] };
    expect(resolvePageSelection(catalogue, document, { kind: 'absent' })).toMatchObject({ entries: [entry], unavailable: 1 });
    expect(resolvePageSelection(catalogue, document, { kind: 'selection', document: { ...emptySelection(), planning: ['a'] } })).toMatchObject({ entries: [], unavailable: 1 });
    expect(resolvePageSelection(catalogue, document, { kind: 'processing' }).entries).toEqual([]);
    expect(resolvePageSelection(catalogue, document, { kind: 'error', error: 'invalid' }).entries).toEqual([]);
    expect(document.games).toEqual(['a', 'missing']);
    expect(catalogue).toEqual([entry]);
});