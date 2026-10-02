import { navigation, setup, categorizedCatalogue, allIds } from './testUtils';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import SelectionButton from './SelectionButton';
import { messages } from './testMessages';
const { en, fr } = messages;

it.each(['en', 'fr'] as const)('shows localized empty selection and catalogue link in %s', locale => {
    setup([], locale);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(locale === 'en' ? en.selection.title : fr.selection.title);
    expect(screen.getByText(locale === 'en' ? en.selection.empty : fr.selection.empty)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: locale === 'en' ? en.selection.browse : fr.selection.browse })).toHaveAttribute('href', '/games');
});

it.each(['light', 'dark'] as const)('removes games and synchronizes multiple accessible controls in %s mode', mode => {
    const { store, wrapper } = setup(['game-0'], 'en', mode);
    render(<SelectionButton id="game-0" title="Alpha" />, { wrapper });
    const buttons = screen.getAllByRole('button', { name: 'Remove Alpha from my selection' });
    expect(buttons).toHaveLength(2);
    buttons.forEach(button => expect(button).toHaveAttribute('aria-pressed', 'true'));
    fireEvent.click(buttons[0]);
    expect(store.getState().selection.ids).toEqual([]);
    expect(screen.getByRole('status')).toHaveTextContent('0 selected items');
    fireEvent.click(screen.getByRole('button', { name: 'Add Alpha to my selection' }));
    expect(screen.getByRole('status')).toHaveTextContent('1 selected item');
    expect(navigation.push).not.toHaveBeenCalled();
});

it('confirms clearing the entire selection and supports cancel', async () => {
    const { store } = setup(['game-0', 'game-1']);
    fireEvent.click(screen.getByRole('button', { name: 'Clear my selection' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(store.getState().selection.ids).toHaveLength(2);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Clear my selection' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Clear my selection' }));
    expect(store.getState().selection.ids).toEqual([]);
});


it.each(['games=game-0', 'games=', 'games=!!!'])('keeps the personal selection for a games-only query: %s', async query => {
    navigation.query = query;
    const { store } = setup(['game-1']);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(en.selection.title);
    expect(screen.getByRole('button', { name: 'Remove Beta from my selection' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: en.selection.import })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: en.selection.openOwn })).not.toBeInTheDocument();
    await waitFor(() => expect(store.getState().selection.ids).toEqual(['game-1']));
    expect(screen.queryByRole('button', { name: 'Add Alpha to my selection' })).not.toBeInTheDocument();
});


it('filters selected items with the existing catalogue title field', async () => {
    setup(['game-0', 'game-1']);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alpha' } });
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Remove Beta from my selection' })).not.toBeInTheDocument());
    expect(screen.getByRole('status')).toHaveTextContent('2 selected items');
});


it.each([['Waiting', 'true', 'false'], ['Upcoming', 'false', 'true']])('preserves %s detail behavior', async (title, vote, related) => {
    setup(allIds, 'en', 'light', categorizedCatalogue);
    fireEvent.click(screen.getByRole('img', { name: title }).closest('button')!);
    const dialog = await screen.findByRole('dialog', { name: title });
    expect(dialog).toHaveAttribute('data-vote', vote);
    expect(dialog).toHaveAttribute('data-related', related);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close details' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it.each([['Alpha', 'game-0'], ['Expansion', 'dlc']])('preserves published %s navigation and detail links in a mixed grid', (title, id) => {
    setup(allIds, 'en', 'light', categorizedCatalogue);
    fireEvent.click(screen.getByRole('img', { name: title }).closest('button')!);
    expect(navigation.push).toHaveBeenCalledWith({ pathname: '/video/[id]', params: { id } });
    navigation.push.mockClear();
    fireEvent.click(screen.getByRole('link', { name: `View details for ${title}` }));
    expect(navigation.push).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: `Remove ${title} from my selection` })).toBeInTheDocument();
});
