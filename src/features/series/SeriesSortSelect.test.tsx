import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { echoTranslations } from '@/test/mocks/nextIntl';
import { SERIES_SORT_OPTIONS } from '@/domain/series/sorting';
import SeriesSortSelect from './SeriesSortSelect';

vi.mock('next-intl', () => echoTranslations());
const responsive = vi.hoisted(() => ({ mobile: false }));
vi.mock('@mui/material/useMediaQuery', () => ({ default: () => responsive.mobile }));

describe.each([false, true])('SeriesSortSelect (mobile: %s)', mobile => {
    beforeEach(() => { responsive.mobile = mobile; });
    it.each(SERIES_SORT_OPTIONS)('preserves the mapping for %s', value => {
        const onChange = vi.fn();
        render(<SeriesSortSelect value={value} onChange={onChange} />);
        const desc = value.endsWith('Desc');
        const field = value.startsWith('name') ? 'count' : 'name';
        const select = screen.getByRole('combobox', { name: 'series.sortSeries.label' });
        if (mobile) fireEvent.change(select, { target: { value: field } });
        else {
            fireEvent.mouseDown(select);
            fireEvent.click(screen.getByRole('option', { name: `common.sort.fields.${field}` }));
        }
        expect(onChange).toHaveBeenLastCalledWith(`${field}${desc ? 'Desc' : 'Asc'}`);
        const button = screen.getByRole('button', { name: `common.sort.direction.${desc ? 'asc' : 'desc'}` });
        expect(button).toBeEnabled();
        expect(button).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
        fireEvent.click(button);
        expect(onChange).toHaveBeenLastCalledWith(`${value.startsWith('name') ? 'name' : 'count'}${desc ? 'Asc' : 'Desc'}`);
    });
});
