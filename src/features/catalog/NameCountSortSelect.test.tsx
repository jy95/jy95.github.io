import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { echoTranslations } from '@/test/mocks/nextIntl';
import { SERIES_SORT_OPTIONS } from '@/domain/series/sorting';
import DlcSortSelect from '@/features/dlcs/DlcSortSelect';
import SeriesSortSelect from '@/features/series/SeriesSortSelect';
import NameCountSortSelect from './NameCountSortSelect';

vi.mock('next-intl', () => echoTranslations());
const responsive = vi.hoisted(() => ({ mobile: false }));
vi.mock('@mui/material/useMediaQuery', () => ({ default: () => responsive.mobile }));

describe.each([false, true])('name/count controls (mobile: %s)', mobile => {
    beforeEach(() => { responsive.mobile = mobile; });
    describe.each([
        { Control: SeriesSortSelect, label: 'series.sortSeries.label' },
        { Control: DlcSortSelect, label: 'dlcs.sortDlcs.label' },
        { Control: (props: Parameters<typeof SeriesSortSelect>[0]) => <NameCountSortSelect {...props} options={SERIES_SORT_OPTIONS} label="Shared label" />, label: 'Shared label' },
    ])('$label', ({ Control, label }) => {
        it.each(SERIES_SORT_OPTIONS)('preserves the mapping for %s', value => {
            const onChange = vi.fn();
            render(<Control value={value} onChange={onChange} />);
            const desc = value.endsWith('Desc');
            const field = value.startsWith('name') ? 'count' : 'name';
            const select = screen.getByRole('combobox', { name: label });
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
    it('rejects unsupported combinations', () => {
        const onChange = vi.fn();
        render(<NameCountSortSelect value="nameAsc" options={["nameAsc"]} label="Limited sort" onChange={onChange} />);
        fireEvent.click(screen.getByRole('button', { name: 'common.sort.direction.desc' }));
        const select = screen.getByRole('combobox', { name: 'Limited sort' });
        if (mobile) fireEvent.change(select, { target: { value: 'count' } });
        else {
            fireEvent.mouseDown(select);
            fireEvent.click(screen.getByRole('option', { name: 'common.sort.fields.count' }));
        }
        expect(onChange).not.toHaveBeenCalled();
    });
});
