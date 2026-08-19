import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => `translated:${key}`,
}));

const dispatchMock = vi.fn();
let mockActiveFilters: { key: string; value: unknown }[] = [];

vi.mock('@/redux/hooks', () => ({
    useAppDispatch: () => dispatchMock,
    useAppSelector: (selector: any) => selector({ games: { activeFilters: mockActiveFilters } }),
}));

import TitleFilter from './TitleFilter';

describe('TitleFilter', () => {
    beforeEach(() => {
        dispatchMock.mockReset();
        mockActiveFilters = [];
    });

    it('renders an empty value when no title filter is active', () => {
        render(<TitleFilter />);
        expect(screen.getByLabelText('translated:title')).toHaveValue('');
    });

    it('renders the currently selected title from the store', () => {
        mockActiveFilters = [{ key: 'selected_title', value: 'zelda' }];
        render(<TitleFilter />);
        expect(screen.getByLabelText('translated:title')).toHaveValue('zelda');
    });

    it('dispatches filterByTitle with the new value on change', () => {
        render(<TitleFilter />);
        fireEvent.change(screen.getByLabelText('translated:title'), { target: { value: 'mario' } });

        expect(dispatchMock).toHaveBeenCalledTimes(1);
        expect(dispatchMock).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'games/filterByTitle', payload: 'mario' })
        );
    });

    it('dispatches an empty-string payload when the field is cleared', () => {
        mockActiveFilters = [{ key: 'selected_title', value: 'zelda' }];
        render(<TitleFilter />);
        fireEvent.change(screen.getByLabelText('translated:title'), { target: { value: '' } });

        expect(dispatchMock).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'games/filterByTitle', payload: '' })
        );
    });

    it('renders as a full-width text field', () => {
        render(<TitleFilter />);
        // MUI fullWidth applies to the root .MuiFormControl-root/.MuiTextField-root
        const field = screen.getByLabelText('translated:title').closest('.MuiTextField-root');
        expect(field).toHaveClass('MuiFormControl-fullWidth');
    });
});
