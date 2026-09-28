import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => `translated:${key}`,
}));

const onChange = vi.fn();
let mockSelectedTitle = '';



import TitleFilter from './TitleFilter';

describe('TitleFilter', () => {
    beforeEach(() => {
        onChange.mockReset();
        mockSelectedTitle = '';
    });

    it('renders an empty value when no title filter is active', () => {
        render(<TitleFilter value={mockSelectedTitle} onChange={onChange} />);
        expect(screen.getByLabelText('translated:title')).toHaveValue('');
    });

    it('renders the currently selected title from props', () => {
        mockSelectedTitle = 'zelda';
        render(<TitleFilter value={mockSelectedTitle} onChange={onChange} />);
        expect(screen.getByLabelText('translated:title')).toHaveValue('zelda');
    });

    it('calls onChange with filterByTitle with the new value on change', () => {
        render(<TitleFilter value={mockSelectedTitle} onChange={onChange} />);
        fireEvent.change(screen.getByLabelText('translated:title'), { target: { value: 'mario' } });

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(
            'mario'
        );
    });

    it('calls onChange with an empty-string payload when the field is cleared', () => {
        mockSelectedTitle = 'zelda';
        render(<TitleFilter value={mockSelectedTitle} onChange={onChange} />);
        fireEvent.change(screen.getByLabelText('translated:title'), { target: { value: '' } });

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
