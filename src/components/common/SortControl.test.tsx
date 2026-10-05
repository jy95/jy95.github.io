import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import SortControl from './SortControl';

const responsive = vi.hoisted(() => ({ mobile: false }));
vi.mock('@mui/material/useMediaQuery', () => ({ default: () => responsive.mobile }));

describe.each([false, true])('SortControl (mobile: %s)', mobile => {
    beforeEach(() => { responsive.mobile = mobile; });
    it('selects fields, labels the next action, and displays the current direction', () => {
        const onFieldChange = vi.fn();
        const onDirectionChange = vi.fn();
        const props = { options: [{ value: 'name', label: 'Name' }, { value: 'count', label: 'Count' }],
            field: 'name', direction: 'asc' as const, label: 'Sort', directionLabels: { asc: 'Ascending', desc: 'Descending' },
            onFieldChange, onDirectionChange };
        const view = render(<SortControl {...props} />);
        const select = screen.getByRole('combobox', { name: 'Sort' });
        expect(select.tagName).toBe(mobile ? 'SELECT' : 'DIV');
        if (mobile) fireEvent.change(select, { target: { value: 'count' } });
        else {
            fireEvent.mouseDown(select);
            fireEvent.click(screen.getByRole('option', { name: 'Count' }));
        }
        expect(onFieldChange).toHaveBeenCalledExactlyOnceWith('count');
        const button = screen.getByRole('button', { name: 'Descending' });
        expect(button).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
        expect(screen.getByTestId('ArrowUpwardIcon')).toHaveAttribute('aria-hidden', 'true');
        fireEvent.click(button);
        expect(onDirectionChange).toHaveBeenCalledExactlyOnceWith('desc');
        view.rerender(<SortControl {...props} direction="desc" />);
        expect(screen.getByTestId('ArrowDownwardIcon')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Ascending' }));
        expect(onDirectionChange).toHaveBeenLastCalledWith('asc');
        view.rerender(<SortControl {...props} directionDisabled />);
        expect(screen.getByRole('button', { name: 'Descending' })).toBeDisabled();
        onDirectionChange.mockClear();
        fireEvent.click(screen.getByRole('button', { name: 'Descending' }));
        expect(onDirectionChange).not.toHaveBeenCalled();
    });
});
