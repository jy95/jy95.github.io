import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { echoTranslations } from '@/test/mocks/nextIntl';

vi.mock('next-intl', () => echoTranslations());

const onChange = vi.fn();
let mockSelectedGenres: number[] = [];

const getGenresQueryMock = vi.fn();
vi.mock('@/redux/services/genresAPI', () => ({
    useGetGenresQuery: () => getGenresQueryMock(),
}));

import GenresSelect from './GenresSelect';

describe('GenresSelect', () => {
    beforeEach(() => {
        onChange.mockReset();
        mockSelectedGenres = [];
        getGenresQueryMock.mockReset().mockReturnValue({
            data: [
                { id: 1, name: 'Action' },
                { id: 2, name: 'Adventure' },
                { id: 13, name: 'Puzzle' },
            ],
            isFetching: false,
        });
    });

    it('renders the translated filter label', () => {
        render(<GenresSelect value={mockSelectedGenres} onChange={onChange} />);
        expect(screen.getByLabelText('gamesLibrary.filtersLabels.genres')).toBeInTheDocument();
    });

    it('selects and removes genres through the autocomplete', async () => {
        const { rerender } = render(<GenresSelect value={mockSelectedGenres} onChange={onChange} />);
        const input = screen.getByLabelText('gamesLibrary.filtersLabels.genres');
        fireEvent.mouseDown(input);
        fireEvent.click(await screen.findByRole('option', { name: 'gamesLibrary.gamesGenres.1' }));
        expect(onChange).toHaveBeenLastCalledWith([1]);

        mockSelectedGenres = [1];
        rerender(<GenresSelect value={mockSelectedGenres} onChange={onChange} />);
        expect(screen.getByText('gamesLibrary.gamesGenres.1')).toBeInTheDocument();
        fireEvent.mouseDown(input);
        fireEvent.click(await screen.findByRole('option', { name: 'gamesLibrary.gamesGenres.13' }));
        expect(onChange).toHaveBeenLastCalledWith([1, 13]);

        mockSelectedGenres = [1, 13];
        rerender(<GenresSelect value={mockSelectedGenres} onChange={onChange} />);
        fireEvent.click(screen.getAllByTestId('CancelIcon')[0]);
        expect(onChange).toHaveBeenLastCalledWith([13]);
    });

    it('does not crash and renders no chips while genres data is still loading', () => {
        getGenresQueryMock.mockReturnValue({ data: undefined, isFetching: true });
        render(<GenresSelect value={mockSelectedGenres} onChange={onChange} />);
        expect(screen.getByLabelText('gamesLibrary.filtersLabels.genres')).toBeInTheDocument();
    });

    it('does not call onChange on initial render', () => {
        render(<GenresSelect value={mockSelectedGenres} onChange={onChange} />);
        expect(onChange).not.toHaveBeenCalled();
    });
});
