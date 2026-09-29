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
        fireEvent.click(screen.getByRole('option', { name: '—' }));
        expect(onChange).toHaveBeenLastCalledWith(undefined);
    });
});
