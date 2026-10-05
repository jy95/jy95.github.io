import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { echoTranslations } from '@/test/mocks/nextIntl';
import { GAME_SORT_OPTIONS, type GameSort } from '@/types/gamesFilters';

vi.mock('next-intl', () => echoTranslations());
const responsive = vi.hoisted(() => ({ mobile: false }));
vi.mock('@mui/material/useMediaQuery', () => ({ default: () => responsive.mobile }));
beforeEach(() => { responsive.mobile = false; });

import SortSelect from './SortSelect';

const label = 'gamesLibrary.sortForm.firstSort';
const directionLabel = (direction: string) => `common.sort.direction.${direction}`;
const fields = ['', ...new Set(GAME_SORT_OPTIONS.map(sort => sort.split('_')[0]))];

function chooseField(value: string) {
    const select = screen.getByRole('combobox', { name: label });
    if (responsive.mobile) fireEvent.change(select, { target: { value } });
    else {
        fireEvent.mouseDown(select);
        fireEvent.click(screen.getAllByRole('option').find(option => option.getAttribute('data-value') === value)!);
    }
}

describe.each([false, true])('SortSelect (mobile: %s)', mobile => {
    beforeEach(() => { responsive.mobile = mobile; });

    it('offers each field once, with the default order and an accessible name', () => {
        const onChange = vi.fn();
        render(<SortSelect onChange={onChange} />);
        const select = screen.getByRole('combobox', { name: label });
        expect(select.tagName).toBe(mobile ? 'SELECT' : 'DIV');
        expect(screen.getByRole('button', { name: directionLabel('desc') })).toBeDisabled();
        if (!mobile) fireEvent.mouseDown(select);
        expect(screen.getAllByRole('option').map(option => option.getAttribute(mobile ? 'value' : 'data-value'))).toEqual(fields);
        if (mobile) fireEvent.change(select, { target: { value: 'title' } });
        else fireEvent.click(screen.getByRole('option', { name: 'common.sort.fields.name' }));
        expect(onChange).toHaveBeenCalledExactlyOnceWith('title_asc');
    });

    it.each(GAME_SORT_OPTIONS)('displays %s and changes only its direction', value => {
        const onChange = vi.fn();
        render(<SortSelect value={value} onChange={onChange} />);
        const [field, direction] = value.split('_');
        const select = screen.getByRole('combobox', { name: label });
        if (mobile) expect(select).toHaveValue(field);
        else {
            fireEvent.mouseDown(select);
            const selected = screen.getAllByRole('option').filter(option => option.getAttribute('aria-selected') === 'true');
            expect(selected).toHaveLength(1);
            expect(selected[0]).toHaveAttribute('data-value', field);
            fireEvent.click(selected[0]);
            onChange.mockClear();
        }
        const nextDirection = direction === 'asc' ? 'desc' : 'asc';
        const button = screen.getByRole('button', { name: directionLabel(nextDirection) });
        expect(button).not.toHaveAttribute('aria-pressed');
        expect(button.parentElement).not.toHaveAttribute('aria-label');
        expect(button).toHaveAttribute('tabindex', '0');
        expect(screen.getByTestId(direction === 'asc' ? 'ArrowUpwardIcon' : 'ArrowDownwardIcon')).toHaveAttribute('aria-hidden', 'true');
        fireEvent.click(button);
        expect(onChange).toHaveBeenCalledExactlyOnceWith(`${field}_${nextDirection}`);
    });

    it('keeps field and direction independent and resets to default order', () => {
        function ControlledSort() {
            const [sort, setSort] = useState<GameSort | undefined>('duration_desc');
            return <SortSelect value={sort} onChange={setSort} />;
        }
        render(<ControlledSort />);
        chooseField('releaseDate');
        expect(screen.getByTestId('ArrowDownwardIcon')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: directionLabel('asc') }));
        expect(screen.getByTestId('ArrowUpwardIcon')).toBeInTheDocument();
        const select = screen.getByRole('combobox', { name: label });
        if (mobile) expect(select).toHaveValue('releaseDate');
        else expect(select).toHaveTextContent('common.sort.fields.releaseDate');
        chooseField('title');
        expect(screen.getByRole('button', { name: directionLabel('desc') })).toBeEnabled();
        chooseField('');
        expect(screen.getByRole('button', { name: directionLabel('desc') })).toBeDisabled();
    });

    it('clears the selected sort to the default order', () => {
        const onChange = vi.fn();
        render(<SortSelect value="duration_desc" onChange={onChange} />);
        chooseField('');
        expect(onChange).toHaveBeenCalledExactlyOnceWith(undefined);
    });
});
