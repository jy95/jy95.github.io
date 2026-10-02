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

it.each([false, true])('supports multiple values and labelled options (mobile: %s)', mobile => {
    responsive.mobile = mobile;
    const onChange = vi.fn();
    const kinds = [{ value: 'games', label: 'Games', icon: <svg data-testid="kind-icon" /> }, { value: 'dlcs', label: 'DLCs' }];
    render(<ResponsiveSelect multiple label="Content kinds" value={['games']} options={kinds} onChange={onChange} />);
    if (mobile) {
        const select = screen.getByRole('listbox', { name: 'Content kinds' }) as HTMLSelectElement;
        expect(select.tagName).toBe('SELECT');
        expect(select).toHaveValue(['games']);
        select.options[0].selected = false;
        select.options[1].selected = true;
        fireEvent.change(select);
        expect(onChange).toHaveBeenCalledExactlyOnceWith(['dlcs']);
        expect(screen.queryByTestId('kind-icon')).not.toBeInTheDocument();
    } else {
        const select = screen.getByRole('combobox', { name: 'Content kinds' });
        expect(select).toHaveTextContent('Games');
        expect(select).toHaveAttribute('aria-labelledby', expect.stringContaining(`${select.id}-label`));
        expect(screen.getByTestId('kind-icon').parentElement).toHaveAttribute('aria-hidden', 'true');
        fireEvent.keyDown(select, { key: 'ArrowDown' });
        expect(screen.getByRole('option', { name: 'Games' })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getAllByRole('checkbox', { hidden: true })).toHaveLength(2);
        fireEvent.click(screen.getByRole('option', { name: 'DLCs' }));
        expect(onChange).toHaveBeenCalledExactlyOnceWith(['games', 'dlcs']);
    }
});

it.each([false, true])('keeps an empty multiple picker labelled and usable (mobile: %s)', mobile => {
    responsive.mobile = mobile;
    const onChange = vi.fn();
    render(<ResponsiveSelect multiple label="Content kinds" value={[]} options={options} onChange={onChange} />);
    const select = screen.getByRole(mobile ? 'listbox' : 'combobox', { name: 'Content kinds' });
    if (mobile) {
        (select as HTMLSelectElement).options[1].selected = true;
        fireEvent.change(select);
    } else {
        fireEvent.mouseDown(select);
        fireEvent.click(screen.getByRole('option', { name: 'PC' }));
    }
    expect(onChange).toHaveBeenCalledExactlyOnceWith(['pc']);
});
