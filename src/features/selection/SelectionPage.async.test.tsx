import { navigation, setup, catalogue } from './testUtils';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { selectionQuery, type SharedSelection } from './sharing';
import * as sharing from './sharing';
import { emptySelection } from './schema';
import SelectionPage from './SelectionPage';
import en from '../../../messages/en.json';
import fr from '../../../messages/fr.json';

it('loads a compressed selection asynchronously and imports categorized games', async () => {
    navigation.query = await selectionQuery({ version: 2, games: ['game-0'], dlcs: [], backlog: [], planning: [] });
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
    vi.stubGlobal('CompressionStream', undefined);
    setup(['game-0']);
    fireEvent.click(screen.getByRole('button', { name: en.selection.share }));
    expect(screen.getByRole('button', { name: en.selection.share })).toBeDisabled();
    expect(screen.getByText(en.selection.processing)).toBeInTheDocument();
    expect(await screen.findByText(en.selection.compressionUnavailable)).toBeInTheDocument();
    vi.unstubAllGlobals();
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
    resolve({ kind: 'error', error: 'invalid' });
    await waitFor(() => expect(screen.queryByText(en.selection.invalid)).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Add Beta to my selection' })).toBeInTheDocument();
    decode.mockRestore();
});

it.each([
    ['query change', 'success'],
    ['query change', 'error'],
    ['unmount', 'success'],
    ['unmount', 'error'],
] as const)('ignores pending encoding after %s (%s)', async (change, outcome) => {
    let resolve!: (query: string) => void;
    let reject!: (error: Error) => void;
    const pending = new Promise<string>((done, fail) => { resolve = done; reject = fail; });
    const encode = vi.spyOn(sharing, 'selectionQuery').mockReturnValue(pending);
    const { rerender, unmount, container } = setup(['game-0']);
    fireEvent.click(screen.getByRole('button', { name: en.selection.share }));
    expect(encode).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: en.selection.share })).toBeDisabled();

    if (change === 'query change') {
        navigation.query = 'title=Beta';
        rerender(<SelectionPage catalogue={catalogue} />);
        expect(screen.getByRole('button', { name: en.selection.share })).toBeEnabled();
    } else {
        unmount();
    }

    await act(async () => {
        if (outcome === 'success') resolve('selection=encoded');
        else reject(new Error('compressionUnavailable'));
        await pending.catch(() => undefined);
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText(en.selection.compressionUnavailable)).not.toBeInTheDocument();
    expect(screen.queryByText(en.selection.processing)).not.toBeInTheDocument();
    if (change === 'unmount') expect(container).toBeEmptyDOMElement();
    else expect(screen.getByRole('button', { name: en.selection.share })).toBeEnabled();
});
