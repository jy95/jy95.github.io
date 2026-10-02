import { navigation, setup, categorizedCatalogue, allIds, openKinds, toggleKind } from './testUtils';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { createTheme, getContrastRatio } from '@mui/material/styles';
import en from '../../../messages/en.json';
import fr from '../../../messages/fr.json';

it.each(['en', 'fr'] as const)('enables all kinds and labels each category icon in %s', locale => {
    setup(allIds, locale, 'light', categorizedCatalogue);
    const labels = (locale === 'en' ? en : fr).selection.categories;
    const icons = { games: 'SportsEsportsIcon', dlcs: 'ExtensionIcon', planning: 'ScheduleIcon', backlog: 'HourglassEmptyIcon' };
    const select = screen.getByRole('combobox', { name: (locale === 'en' ? en : fr).selection.kinds });
    expect(select).toHaveAttribute('aria-labelledby', expect.stringContaining(select.id + '-label'));
    for (const label of Object.values(labels)) expect(within(select).getByText(label)).toBeInTheDocument();
    const listbox = openKinds(locale);
    for (const category of ['games', 'backlog', 'dlcs', 'planning'] as const) {
        const option = within(listbox).getByRole('option', { name: labels[category] });
        expect(option).toHaveAttribute('aria-selected', 'true');
        expect(within(option).getByTestId(icons[category])).toHaveAttribute('aria-hidden', 'true');
    }
    fireEvent.keyDown(listbox, { key: 'Escape' });
    for (const category of ['games', 'backlog', 'dlcs', 'planning'] as const) {
        const badges = screen.getAllByRole('img', { name: labels[category] });
        expect(badges).toHaveLength(categorizedCatalogue.filter(entry => entry.category === category).length);
        badges.forEach(badge => expect(within(badge).getByTestId(icons[category])).toBeInTheDocument());
    }
});

it.each(['en', 'fr'] as const)('toggles individual kinds and keeps controls when every kind is unchecked in %s', locale => {
    const text = (locale === 'en' ? en : fr).selection;
    const { store } = setup(allIds, locale, 'light', categorizedCatalogue);
    const document = store.getState().selection.document;
    for (const category of ['games', 'dlcs', 'planning', 'backlog'] as const) {
        toggleKind(text.categories[category], locale);
        for (const entry of categorizedCatalogue.filter(entry => entry.category === category)) {
            expect(screen.queryByRole('img', { name: entry.game.title })).not.toBeInTheDocument();
        }
    }
    expect(screen.getByText((locale === 'en' ? en : fr).common.noResults)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.queryByText(text.empty)).not.toBeInTheDocument();
    expect(store.getState().selection.document).toEqual(document);
    expect(screen.getByRole('combobox', { name: text.kinds })).toBeInTheDocument();
    const listbox = openKinds(locale);
    within(listbox).getAllByRole('option').forEach(option => expect(option).toHaveAttribute('aria-selected', 'false'));
    fireEvent.keyDown(listbox, { key: 'Escape' });
    toggleKind(text.categories.dlcs, locale);
    expect(screen.getByRole('img', { name: 'Expansion' })).toBeInTheDocument();
});

it('combines kinds with catalogue filtering and sorts the unified grid', async () => {
    navigation.sort = 'title_desc';
    setup(allIds, 'en', 'light', categorizedCatalogue);
    const covers = () => screen.getAllByRole('img').filter(image => !image.querySelector('svg')).map(image => image.getAttribute('aria-label'));
    expect(covers()).toEqual(['Waiting', 'Upcoming', 'Expansion', 'Beta', 'Alpha']);
    toggleKind('Backlog');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alpha' } });
    await waitFor(() => expect(covers()).toEqual(['Expansion', 'Alpha']));
    toggleKind('DLCs');
    expect(covers()).toEqual(['Alpha']);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'zzzzzzzzzz' } });
    await screen.findByText(en.common.noResults);
    expect(screen.getByRole('combobox', { name: en.selection.kinds })).toBeInTheDocument();
});


it.each(['en', 'fr'] as const)('supports keyboard opening, toggling and Escape with focus restoration in %s', locale => {
    setup(allIds, locale, 'light', categorizedCatalogue);
    const text = (locale === 'en' ? en : fr).selection;
    const select = screen.getByRole('combobox', { name: text.kinds });
    select.focus();
    expect(select).toHaveFocus();
    fireEvent.keyDown(select, { key: 'ArrowDown' });
    const listbox = screen.getByRole('listbox');
    const option = within(listbox).getByRole('option', { name: text.categories.games });
    expect(option).toHaveFocus();
    fireEvent.keyDown(option, { key: 'Enter' });
    fireEvent.keyUp(option, { key: 'Enter' });
    expect(option).toHaveAttribute('aria-selected', 'false');
    fireEvent.keyDown(option, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(select).toHaveFocus();
    expect(screen.queryByRole('img', { name: 'Alpha' })).not.toBeInTheDocument();
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
