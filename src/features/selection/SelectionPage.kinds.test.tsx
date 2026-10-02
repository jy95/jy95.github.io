import { navigation, setup, categorizedCatalogue, allIds, chooseKind } from './testUtils';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { createTheme, getContrastRatio } from '@mui/material/styles';
import { SELECTION_CATEGORIES } from './documentTypes';
import en from '../../../messages/en.json';
import fr from '../../../messages/fr.json';

const icons = { games: 'SportsEsportsIcon', dlcs: 'ExtensionIcon', planning: 'ScheduleIcon', backlog: 'HourglassEmptyIcon' };

it.each([['en', false], ['fr', false], ['en', true], ['fr', true]] as const)('selects one kind with localized labels in %s (mobile: %s)', (locale, mobile) => {
    navigation.mobile = mobile;
    const { store } = setup(allIds, locale, 'light', categorizedCatalogue);
    const text = (locale === 'en' ? en : fr).selection;
    const select = screen.getByRole('combobox', { name: text.kinds });
    const document = store.getState().selection.document;
    expect(screen.getByLabelText(text.kinds)).toBe(select);
    if (mobile) {
        expect(select.tagName).toBe('SELECT');
        expect(select).toHaveValue('all');
        expect(within(select).getAllByRole('option').map(option => option.textContent)).toEqual([
            text.categories.all, ...SELECTION_CATEGORIES.map(category => text.categories[category]),
        ]);
    } else {
        expect(select).toHaveTextContent(text.categories.all);
        expect(select).toHaveAttribute('aria-labelledby', expect.stringContaining(select.id + '-label'));
        expect(within(select).getByTestId('AppsIcon')).toHaveAttribute('aria-hidden', 'true');
        fireEvent.mouseDown(select);
        const options = within(screen.getByRole('listbox')).getAllByRole('option');
        expect(options[0]).toHaveTextContent(text.categories.all);
        for (const category of SELECTION_CATEGORIES) {
            const option = screen.getByRole('option', { name: text.categories[category] });
            expect(within(option).getByTestId(icons[category])).toHaveAttribute('aria-hidden', 'true');
        }
        fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
    }
    for (const entry of categorizedCatalogue) expect(screen.getByRole('img', { name: entry.game.title })).toBeInTheDocument();
    for (const category of SELECTION_CATEGORIES) {
        const badges = screen.getAllByRole('img', { name: text.categories[category] });
        expect(badges).toHaveLength(categorizedCatalogue.filter(entry => entry.category === category).length);
        badges.forEach(badge => expect(within(badge).getByTestId(icons[category])).toHaveAttribute('aria-hidden', 'true'));
    }
    for (const category of SELECTION_CATEGORIES) {
        chooseKind(text.categories[category], locale);
        for (const entry of categorizedCatalogue) {
            expect(Boolean(screen.queryByRole('img', { name: entry.game.title }))).toBe(entry.category === category);
        }
    }
    chooseKind(text.categories.all, locale);
    for (const entry of categorizedCatalogue) expect(screen.getByRole('img', { name: entry.game.title })).toBeInTheDocument();
    expect(store.getState().selection.document).toEqual(document);
});

it.each([false, true])('keeps the kind select visible when a kind has no entries (mobile: %s)', mobile => {
    navigation.mobile = mobile;
    setup(['game-0']);
    chooseKind(en.selection.categories.backlog);
    expect(screen.getByText(en.common.noResults)).toBeInTheDocument();
    expect(screen.queryByText(en.selection.empty)).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: en.selection.kinds })).toBeInTheDocument();
    chooseKind(en.selection.categories.all);
    expect(screen.getByRole('img', { name: 'Alpha' })).toBeInTheDocument();
});

it('combines kind selection with catalogue filtering and sorting', async () => {
    navigation.sort = 'title_desc';
    setup(allIds, 'en', 'light', categorizedCatalogue);
    const covers = () => screen.getAllByRole('img').filter(image => !image.querySelector('svg')).map(image => image.getAttribute('aria-label'));
    expect(covers()).toEqual(['Waiting', 'Upcoming', 'Expansion', 'Beta', 'Alpha']);
    chooseKind('Games');
    expect(covers()).toEqual(['Beta', 'Alpha']);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alpha' } });
    await waitFor(() => expect(covers()).toEqual(['Alpha']));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'zzzzzzzzzz' } });
    await screen.findByText(en.common.noResults);
    expect(screen.getByRole('combobox', { name: en.selection.kinds })).toBeInTheDocument();
});

it.each(['en', 'fr'] as const)('supports keyboard selection and restores focus in %s', locale => {
    setup(allIds, locale, 'light', categorizedCatalogue);
    const text = (locale === 'en' ? en : fr).selection;
    const select = screen.getByRole('combobox', { name: text.kinds });
    select.focus();
    fireEvent.keyDown(select, { key: 'ArrowDown' });
    const option = screen.getByRole('option', { name: text.categories.games });
    option.focus();
    fireEvent.keyDown(option, { key: 'Enter' });
    fireEvent.keyUp(option, { key: 'Enter' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(select).toHaveFocus();
    expect(select).toHaveTextContent(text.categories.games);
    expect(screen.queryByRole('img', { name: 'Expansion' })).not.toBeInTheDocument();
});

it.each(['light', 'dark'] as const)('uses contrasting theme colors for category badges in %s mode', mode => {
    setup(allIds, 'en', mode, categorizedCatalogue);
    const badge = screen.getAllByRole('img', { name: 'Games' })[0];
    const theme = createTheme({ palette: { mode } });
    expect(badge).toHaveStyle({ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary });
    // Composite the light theme's translucent text over its paper background.
    const foreground = mode === 'light' ? '#212121' : theme.palette.text.primary;
    expect(getContrastRatio(foreground, theme.palette.background.paper)).toBeGreaterThan(4.5);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
});
