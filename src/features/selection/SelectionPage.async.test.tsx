import { navigation, setup, catalogue } from './testUtils';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { selectionQuery, type SharedSelection } from './sharing';
import * as sharing from './sharing';
import { emptySelection } from './schema';
import SelectionPage from './SelectionPage';
import { messages } from './testMessages';
import type { SelectionEntry } from './catalogue';
const { en, fr } = messages;

it('loads a shared selection asynchronously and imports categorized games', async () => {
    navigation.query = await selectionQuery({ games: ['game-0'], dlcs: [], backlog: [], planning: [] });
    const { selection } = setup(['game-1']);
    expect(screen.getAllByRole('progressbar')).toHaveLength(1);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: en.selection.import })).not.toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: en.selection.import }));
    expect(selection.getState().document.games).toEqual(['game-1', 'game-0']);
});
it('shows localized decode errors without offering import', async () => {
    navigation.query = 'entries=!!!';
    setup([], 'fr');
    expect(await screen.findByText(fr.selection.invalid)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: fr.selection.import })).not.toBeInTheDocument();
    expect(screen.queryByText(fr.selection.sharedEmpty)).not.toBeInTheDocument();
});
it('disables sharing during encoding and reports missing compression support', async () => {
    vi.spyOn(sharing, 'selectionQuery').mockRejectedValue(new Error('compressionUnavailable'));
    setup(['game-0']);
    const shareButton = screen.getByRole('button', { name: en.selection.share });
    fireEvent.click(shareButton);
    expect(shareButton).toBeDisabled();
    expect(screen.getByText(en.selection.processing)).toBeInTheDocument();
    expect(await screen.findByText(en.selection.compressionUnavailable)).toBeInTheDocument();
});
it('ignores a stale decode after query parameters change', async () => {
    let resolve!: (result: SharedSelection) => void;
    const realDecode = sharing.parseSharedSelection;
    const decode = vi.spyOn(sharing, 'parseSharedSelection').mockImplementation(params => params.getAll('entries')[0] === 'pending' ? new Promise(done => { resolve = done; }) : realDecode(params));
    navigation.query = 'entries=pending';
    const { rerender } = setup();
    navigation.query = await selectionQuery({ ...emptySelection(), games: ['game-1'] });
    rerender(<SelectionPage catalogue={catalogue} />);
    await screen.findByRole('button', { name: 'Add Beta to my selection' });
    await act(async () => resolve({ kind: 'error', error: 'invalid' }));
    await waitFor(() => expect(screen.queryByText(en.selection.invalid)).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Add Beta to my selection' })).toBeInTheDocument();
    decode.mockRestore();
});

it.each(['success', 'error'] as const)('continues pending encoding across title-filter changes (%s)', async outcome => {
    let resolve!: (query: string) => void;
    let reject!: (error: Error) => void;
    const pending = new Promise<string>((done, fail) => { resolve = done; reject = fail; });
    const encode = vi.spyOn(sharing, 'selectionQuery').mockReturnValue(pending);
    const { rerender } = setup(['game-0', 'game-1']);
    const shareButton = screen.getByRole('button', { name: en.selection.share });
    fireEvent.click(shareButton);
    expect(encode).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alpha' } });
    navigation.query = 'title=Alpha';
    rerender(<SelectionPage catalogue={catalogue} />);
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Remove Beta from my selection' })).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Remove Alpha from my selection' })).toBeInTheDocument();
    expect(encode).toHaveBeenCalledTimes(1);
    expect(encode).toHaveBeenCalledWith({ ...emptySelection(), games: ['game-0', 'game-1'] });
    const sharingDisabled = (shareButton as HTMLButtonElement).disabled;
    const processing = screen.queryByText(en.selection.processing);
    // Settle before asserting share state so a production failure leaves no pending work.
    await act(async () => {
        if (outcome === 'success') resolve('entries=encoded');
        else reject(new Error('compressionUnavailable'));
        await pending.catch(() => undefined);
    });

    if (outcome === 'success') {
        const input = await screen.findByRole('textbox', { name: en.selection.shareLink });
        expect(new URL((input as HTMLInputElement).value).search).toBe('?entries=encoded');
    } else {
        expect(await screen.findByText(en.selection.compressionUnavailable)).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    }
    expect(screen.queryByText(en.selection.processing)).not.toBeInTheDocument();
    expect(shareButton).toBeEnabled();
    expect(sharingDisabled).toBe(true);
    expect(processing).not.toBeNull();
});

it.each(['success', 'error'] as const)('ignores pending encoding after unmount (%s)', async outcome => {
    let resolve!: (query: string) => void;
    let reject!: (error: Error) => void;
    const pending = new Promise<string>((done, fail) => { resolve = done; reject = fail; });
    const encode = vi.spyOn(sharing, 'selectionQuery').mockReturnValue(pending);
    const { unmount, container } = setup(['game-0']);
    const shareButton = screen.getByRole('button', { name: en.selection.share });
    fireEvent.click(shareButton);
    expect(encode).toHaveBeenCalledTimes(1);
    unmount();

    await act(async () => {
        if (outcome === 'success') resolve('entries=encoded');
        else reject(new Error('compressionUnavailable'));
        await pending.catch(() => undefined);
    });

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText(en.selection.compressionUnavailable)).not.toBeInTheDocument();
    expect(screen.queryByText(en.selection.processing)).not.toBeInTheDocument();
});

it('renders pages of twelve, disables at exhaustion, and resets on filters and selection changes', async () => {
    const entries = Array.from({ length: 30 }, (_, index): SelectionEntry => ({
        source: 'published', category: 'games', selectionId: `item-${index}`,
        game: { ...catalogue[0].game, id: `item-${index}`, title: `Item ${index}`, url_type: 'VIDEO', url: 'https://youtube.com' },
    }));
    const { rerender } = setup(entries.map(entry => entry.selectionId), 'en', 'light', entries);
    const more = () => screen.getByRole('button', { name: en.common.loadMore });
    expect(screen.getAllByRole('img', { name: /^Item / })).toHaveLength(12);
    fireEvent.click(more());
    expect(screen.getAllByRole('img', { name: /^Item / })).toHaveLength(24);
    fireEvent.click(more());
    expect(screen.getAllByRole('img', { name: /^Item / })).toHaveLength(30);
    expect(more()).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Item' } });
    await waitFor(() => expect(screen.getAllByRole('img', { name: /^Item / })).toHaveLength(12));
    fireEvent.click(more());
    fireEvent.click(screen.getByRole('button', { name: 'Remove Item 0 from my selection' }));
    expect(screen.getAllByRole('img', { name: /^Item / })).toHaveLength(12);
    navigation.query = await selectionQuery({ ...emptySelection(), games: entries.map(entry => entry.selectionId) });
    rerender(<SelectionPage catalogue={entries} />);
    await screen.findByRole('button', { name: en.selection.import });
    expect(screen.getAllByRole('img', { name: /^Item / })).toHaveLength(12);
});

it('restores saved entries on route navigation and remount without losing unresolved identifiers', async () => {
    const { wrapper, unmount, selection, rerender } = setup(['game-0', 'missing']);
    navigation.query = await selectionQuery({ ...emptySelection(), games: ['game-1'] });
    rerender(<SelectionPage catalogue={catalogue} />);
    await screen.findByRole('button', { name: 'Add Beta to my selection' });
    navigation.query = '';
    rerender(<SelectionPage catalogue={catalogue} />);
    expect(screen.getByRole('button', { name: 'Remove Alpha from my selection' })).toBeInTheDocument();
    unmount();
    const { render } = await import('@testing-library/react');
    render(<SelectionPage catalogue={catalogue} />, { wrapper });
    expect(screen.getByRole('button', { name: 'Remove Alpha from my selection' })).toBeInTheDocument();
    expect(selection.getState().document.games).toEqual(['game-0', 'missing']);
});

it('resets pagination when sorting or content kind changes', async () => {
    const { renderHook } = await import('@testing-library/react');
    const { createProviders } = await import('./testUtils');
    const { useSelectionPage } = await import('./useSelectionPage');
    const entries = Array.from({ length: 30 }, (_, index): SelectionEntry => ({
        source: 'published', category: 'games', selectionId: `item-${index}`,
        game: { ...catalogue[0].game, id: `item-${index}`, title: `Item ${index}`, url_type: 'VIDEO', url: 'https://youtube.com' },
    }));
    const { wrapper } = createProviders(entries.map(entry => entry.selectionId));
    const { result } = renderHook(() => useSelectionPage(entries), { wrapper });
    act(() => result.current.results.loadMore());
    expect(result.current.results.visibleEntries).toHaveLength(24);
    act(() => result.current.results.updateFilters({ sort: 'title_desc' }));
    expect(result.current.results.visibleEntries).toHaveLength(12);
    act(() => result.current.results.loadMore());
    act(() => result.current.results.setKind('games'));
    expect(result.current.results.visibleEntries).toHaveLength(12);
});
