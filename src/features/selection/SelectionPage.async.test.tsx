import { navigation, setup, catalogue } from './testUtils';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { selectionQuery, type SharedSelection } from './sharing';
import * as sharing from './sharing';
import { emptySelection } from './schema';
import SelectionPage from './SelectionPage';
import { messages } from './testMessages';
const { en, fr } = messages;

it('loads a shared selection asynchronously and imports categorized games', async () => {
    navigation.query = await selectionQuery({ games: ['game-0'], dlcs: [], backlog: [], planning: [] });
    const { store } = setup(['game-1']);
    expect(screen.getAllByRole('progressbar')).toHaveLength(1);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: en.selection.import })).not.toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: en.selection.import }));
    expect(store.getState().selection.document.games).toEqual(['game-1', 'game-0']);
});
it('shows localized decode errors without offering import', async () => {
    navigation.query = 'selection=!!!';
    setup([], 'fr');
    expect(await screen.findByText(fr.selection.invalid)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: fr.selection.import })).not.toBeInTheDocument();
    expect(screen.queryByText(fr.selection.sharedEmpty)).not.toBeInTheDocument();
});
it('disables sharing during encoding and reports missing compression support', async () => {
    vi.spyOn(sharing, 'selectionQuery').mockRejectedValue(new Error('compressionUnavailable'));
    setup(['game-0']);
    fireEvent.click(screen.getByRole('button', { name: en.selection.share }));
    expect(screen.getByRole('button', { name: en.selection.share })).toBeDisabled();
    expect(screen.getByText(en.selection.processing)).toBeInTheDocument();
    expect(await screen.findByText(en.selection.compressionUnavailable)).toBeInTheDocument();
});
it('ignores a stale decode after query parameters change', async () => {
    let resolve!: (result: SharedSelection) => void;
    const realDecode = sharing.parseSharedSelection;
    const decode = vi.spyOn(sharing, 'parseSharedSelection').mockImplementation(params => params.get('selection') === 'pending' ? new Promise(done => { resolve = done; }) : realDecode(params));
    navigation.query = 'selection=pending';
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
    fireEvent.click(screen.getByRole('button', { name: en.selection.share }));
    expect(encode).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alpha' } });
    navigation.query = 'title=Alpha';
    rerender(<SelectionPage catalogue={catalogue} />);
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Remove Beta from my selection' })).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Remove Alpha from my selection' })).toBeInTheDocument();
    expect(encode).toHaveBeenCalledTimes(1);
    expect(encode).toHaveBeenCalledWith({ ...emptySelection(), games: ['game-0', 'game-1'] });
    const sharingDisabled = (screen.getByRole('button', { name: en.selection.share }) as HTMLButtonElement).disabled;
    const processing = screen.queryByText(en.selection.processing);
    // Settle before asserting share state so a production failure leaves no pending work.
    await act(async () => {
        if (outcome === 'success') resolve('selection=encoded');
        else reject(new Error('compressionUnavailable'));
        await pending.catch(() => undefined);
    });

    if (outcome === 'success') {
        const input = await screen.findByRole('textbox', { name: en.selection.shareLink });
        expect(new URL((input as HTMLInputElement).value).search).toBe('?selection=encoded');
    } else {
        expect(await screen.findByText(en.selection.compressionUnavailable)).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    }
    expect(screen.queryByText(en.selection.processing)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: en.selection.share })).toBeEnabled();
    expect(sharingDisabled).toBe(true);
    expect(processing).not.toBeNull();
});

it.each(['success', 'error'] as const)('ignores pending encoding after unmount (%s)', async outcome => {
    let resolve!: (query: string) => void;
    let reject!: (error: Error) => void;
    const pending = new Promise<string>((done, fail) => { resolve = done; reject = fail; });
    const encode = vi.spyOn(sharing, 'selectionQuery').mockReturnValue(pending);
    const { unmount, container } = setup(['game-0']);
    fireEvent.click(screen.getByRole('button', { name: en.selection.share }));
    expect(encode).toHaveBeenCalledTimes(1);
    unmount();

    await act(async () => {
        if (outcome === 'success') resolve('selection=encoded');
        else reject(new Error('compressionUnavailable'));
        await pending.catch(() => undefined);
    });

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText(en.selection.compressionUnavailable)).not.toBeInTheDocument();
    expect(screen.queryByText(en.selection.processing)).not.toBeInTheDocument();
});
