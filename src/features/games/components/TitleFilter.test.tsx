import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => `translated:${key}`,
}));

const onChange = vi.fn();
let mockSelectedTitle = '';



import TitleFilter from './TitleFilter';

describe('TitleFilter', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        onChange.mockReset();
        mockSelectedTitle = '';
    });

    afterEach(() => vi.useRealTimers());

    it('renders an empty value when no title filter is active', () => {
        render(<TitleFilter value={mockSelectedTitle} onChange={onChange} />);
        expect(screen.getByLabelText('translated:title')).toHaveValue('');
    });

    it('renders the currently selected title from props', () => {
        mockSelectedTitle = 'zelda';
        render(<TitleFilter value={mockSelectedTitle} onChange={onChange} />);
        expect(screen.getByLabelText('translated:title')).toHaveValue('zelda');
    });

    it('debounces rapid typing for 300ms', () => {
        render(<TitleFilter value={mockSelectedTitle} onChange={onChange} />);
        fireEvent.change(screen.getByLabelText('translated:title'), { target: { value: 'mario' } });

        act(() => vi.advanceTimersByTime(200));
        fireEvent.change(screen.getByLabelText('translated:title'), { target: { value: 'mario kart' } });
        act(() => vi.advanceTimersByTime(299));
        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByLabelText('translated:title')).toHaveValue('mario kart');
        act(() => vi.advanceTimersByTime(1));
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(
            'mario kart'
        );
    });

    it('calls onChange with an empty-string payload when the field is cleared', () => {
        mockSelectedTitle = 'zelda';
        render(<TitleFilter value={mockSelectedTitle} onChange={onChange} />);
        fireEvent.change(screen.getByLabelText('translated:title'), { target: { value: '' } });

        act(() => vi.advanceTimersByTime(300));
        expect(onChange).toHaveBeenCalledWith(
            ''
        );
    });

    it('renders as a full-width text field', () => {
        render(<TitleFilter value={mockSelectedTitle} onChange={onChange} />);
        // MUI fullWidth applies to the root .MuiFormControl-root/.MuiTextField-root
        const field = screen.getByLabelText('translated:title').closest('.MuiTextField-root');
        expect(field).toHaveClass('MuiFormControl-fullWidth');
    });
});

it('cancels a pending edit on external URL title changes', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const { rerender } = render(<TitleFilter value="Zelda" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Mario' } });
    rerender(<TitleFilter value="Sonic" onChange={onChange} />);
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByRole('textbox')).toHaveValue('Sonic');
    expect(onChange).not.toHaveBeenCalled();
    vi.useRealTimers();
});

it('uses the latest callback without restarting the timer on unrelated renders', () => {
    vi.useFakeTimers();
    const oldChange = vi.fn();
    const newChange = vi.fn();
    const { rerender, unmount } = render(<TitleFilter value="" onChange={oldChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Mario' } });
    act(() => vi.advanceTimersByTime(200));
    rerender(<TitleFilter value="" onChange={newChange} />);
    act(() => vi.advanceTimersByTime(100));
    expect(oldChange).not.toHaveBeenCalled();
    expect(newChange).toHaveBeenCalledExactlyOnceWith('Mario');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Sonic' } });
    unmount();
    act(() => vi.advanceTimersByTime(300));
    expect(newChange).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
});
