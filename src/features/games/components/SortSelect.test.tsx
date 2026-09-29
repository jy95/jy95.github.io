import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { echoTranslations } from '@/test/mocks/nextIntl';
import { GAME_SORT_OPTIONS } from '@/types/gamesFilters';

vi.mock('next-intl', () => echoTranslations());

import SortSelect from './SortSelect';

describe('SortSelect', () => {
    it('offers every sort option and forwards the selection', () => {
        const onChange = vi.fn();
        render(<SortSelect onChange={onChange} />);

        fireEvent.mouseDown(screen.getByRole('combobox', { name: 'gamesLibrary.sortForm.firstSort' }));
        const options = screen.getAllByRole('option');
        expect(options.map(option => option.getAttribute('data-value'))).toEqual(['', ...GAME_SORT_OPTIONS]);

        fireEvent.click(screen.getByRole('option', { name: 'gamesLibrary.sortLabels.name ↑' }));
        expect(onChange).toHaveBeenLastCalledWith('title_asc');
    });

    it('displays the selected sort and clears it to the default order', () => {
        const onChange = vi.fn();
        render(<SortSelect value="duration_desc" onChange={onChange} />);

        const select = screen.getByRole('combobox');
        expect(select).toHaveTextContent('gamesLibrary.sortLabels.duration ↓');
        fireEvent.mouseDown(select);
        fireEvent.click(screen.getByRole('option', { name: 'gamesLibrary.sortLabels.default' }));
        expect(onChange).toHaveBeenLastCalledWith(undefined);
    });
});

it('opens a compact sort menu with the current selection and preserves all options', () => {
    const onChange = vi.fn();
    render(<SortSelect compact value="duration_desc" onChange={onChange} />);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'gamesLibrary.sortForm.firstSort: gamesLibrary.sortLabels.duration ↓' }));
    expect(screen.getAllByRole('menuitemradio')).toHaveLength(GAME_SORT_OPTIONS.length + 1);
    expect(screen.getByRole('menuitemradio', { name: 'gamesLibrary.sortLabels.duration ↓' })).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'gamesLibrary.sortLabels.default' }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith(undefined);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
});
