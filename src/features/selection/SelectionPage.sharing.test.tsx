import { navigation, setup, categorizedCatalogue, chooseKind } from './testUtils';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { parseSharedSelection, selectionQuery } from './sharing';
import { emptySelection, selectionIds } from './schema';
import { messages } from './testMessages';
const { en, fr } = messages;

it('displays shared games without overwriting personal games, ignores outdated IDs and imports once', async () => {
    navigation.query = await selectionQuery({ ...emptySelection(), games: ['game-0', 'game-0', 'outdated'] });
    const { store } = setup(['game-1']);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('1 selected item'));
    expect(screen.getByText('1 item is no longer available in the catalogue.')).toBeInTheDocument();
    expect(store.getState().selection.ids).toEqual(['game-1']);
    fireEvent.click(screen.getByRole('button', { name: 'Add these items to my selection' }));
    expect(store.getState().selection.ids).toEqual(['game-1', 'game-0']);
    expect(screen.getByRole('button', { name: 'All items are in my selection' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'Open my selection' })).toHaveAttribute('href', '/selection');
});

it('treats an empty shared selection as an empty shared selection', async () => {
    navigation.query = await selectionQuery(emptySelection());
    setup(['game-1']);
    expect(await screen.findByText(en.selection.sharedEmpty)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('0 selected items');
});


it.each(['en', 'fr'] as const)('generates a locale-aware URL and provides manual copying when clipboard is denied in %s', async locale => {
    setup(['game-0', 'game-1'], locale);
    const text = locale === 'en' ? en.selection : fr.selection;
    fireEvent.click(screen.getByRole('button', { name: text.share }));
    const url = new URL((await screen.findByRole('textbox', { name: text.shareLink }) as HTMLInputElement).value);
    expect(url.pathname).toBe(locale === 'en' ? '/en/selection' : '/selection');
    const decoded = await parseSharedSelection(url.searchParams);
    expect(decoded.kind).toBe('selection');
    if (decoded.kind === 'selection') expect(selectionIds(decoded.document)).toEqual(['game-0', 'game-1']);
    fireEvent.click(screen.getByRole('button', { name: text.copy }));
    expect(await screen.findByText(text.copyFallback)).toBeInTheDocument();
});


it('copies the generated link when clipboard access succeeds', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    setup(['game-0']);
    fireEvent.click(screen.getByRole('button', { name: 'Share selection' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Copy link' }));
    expect(await screen.findByText('Link copied')).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('/en/selection?selection='));
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
});


it('shares the full selection while display filters hide games', async () => {
    setup(['game-0', 'game-1']);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alpha' } });
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Remove Beta from my selection' })).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: en.selection.share }));
    const url = new URL((await screen.findByRole('textbox', { name: en.selection.shareLink }) as HTMLInputElement).value);
    expect(await parseSharedSelection(url.searchParams)).toEqual({ kind: 'selection', document: { ...emptySelection(), games: ['game-0', 'game-1'] } });
});


it.each(['en', 'fr'] as const)('imports and shares all categories while other kinds are hidden in %s', async locale => {
    const text = (locale === 'en' ? en : fr).selection;
    const document = { ...emptySelection(), games: ['game-0', 'game-1'], backlog: ['42'], dlcs: ['dlc'], planning: ['planned'] };
    navigation.query = await selectionQuery(document);
    const { store } = setup([], locale, 'light', categorizedCatalogue);
    await screen.findByRole('button', { name: text.import });
    chooseKind(text.categories.games, locale);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alpha' } });
    fireEvent.click(screen.getByRole('button', { name: text.import }));
    expect(store.getState().selection.document).toEqual(document);
    fireEvent.click(screen.getByRole('button', { name: text.share }));
    const url = new URL((await screen.findByRole('textbox', { name: text.shareLink }) as HTMLInputElement).value);
    expect(await parseSharedSelection(url.searchParams)).toEqual({ kind: 'selection', document });
});
