import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ResponsiveSelect from './ResponsiveSelect';

const responsive = vi.hoisted(() => ({ mobile: false }));
vi.mock('@mui/material/useMediaQuery', () => ({ default: () => responsive.mobile }));
beforeEach(() => { responsive.mobile = false; });
const options = [{ value: '', label: 'Any' }, { value: 'pc', label: 'PC' }];

describe.each([false, true])('ResponsiveSelect (mobile: %s)', mobile => {
    it('associates distinct labels and forwards values through the same API', () => {
        responsive.mobile = mobile;
        const onChange = vi.fn();
        render(<>
            <ResponsiveSelect label="Platform" value="pc" options={options} onChange={onChange} />
            <ResponsiveSelect label="Other field" value="" options={options} onChange={vi.fn()} />
        </>);
        const select = screen.getByRole('combobox', { name: 'Platform' });
        const other = screen.getByRole('combobox', { name: 'Other field' });
        expect(select.id).not.toBe(other.id);
        expect(screen.getByLabelText('Platform')).toBe(select);
        if (mobile) {
            expect(select).toHaveValue('pc');
            expect(other).toHaveValue('');
            fireEvent.change(select, { target: { value: '' } });
        } else {
            expect(select).toHaveTextContent('PC');
            expect(other).toHaveTextContent('Any');
            fireEvent.keyDown(select, { key: 'ArrowDown' });
            expect(screen.getByRole('listbox', { name: 'Platform' })).toBeInTheDocument();
            fireEvent.click(screen.getByRole('option', { name: 'Any' }));
        }
        expect(onChange).toHaveBeenCalledExactlyOnceWith('');
    });
});

it('retains the controlled value across viewport changes without publishing a change', () => {
    const onChange = vi.fn();
    const { rerender } = render(<ResponsiveSelect label="Platform" value="pc" options={options} onChange={onChange} />);
    responsive.mobile = true;
    rerender(<ResponsiveSelect label="Platform" value="pc" options={options} onChange={onChange} />);
    expect(screen.getByRole('combobox', { name: 'Platform' })).toHaveValue('pc');
    responsive.mobile = false;
    rerender(<ResponsiveSelect label="Platform" value="pc" options={options} onChange={onChange} />);
    expect(screen.getByRole('combobox', { name: 'Platform' })).toHaveTextContent('PC');
    expect(onChange).not.toHaveBeenCalled();
});

it.each([false, true])('supports single-value option icons (mobile: %s)', mobile => {
    responsive.mobile = mobile;
    const onChange = vi.fn();
    const kinds = [{ value: 'all', label: 'All', icon: <svg aria-hidden="true" data-testid="kind-icon" /> }, { value: 'games', label: 'Games' }];
    render(<ResponsiveSelect label="Content kinds" value="all" options={kinds} onChange={onChange} />);
    const select = screen.getByRole('combobox', { name: 'Content kinds' });
    if (mobile) {
        expect(select.tagName).toBe('SELECT');
        expect(select).toHaveValue('all');
        expect(screen.queryByTestId('kind-icon')).not.toBeInTheDocument();
        fireEvent.change(select, { target: { value: 'games' } });
    } else {
        expect(select).toHaveTextContent('All');
        expect(screen.getByTestId('kind-icon').parentElement).toHaveAttribute('aria-hidden', 'true');
        fireEvent.keyDown(select, { key: 'ArrowDown' });
        fireEvent.click(screen.getByRole('option', { name: 'Games' }));
    }
    expect(onChange).toHaveBeenCalledExactlyOnceWith('games');
});
