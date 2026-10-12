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
        render(<GenresSelect value={[1, 999]} onChange={onChange} />);
        expect(screen.getByLabelText('gamesLibrary.filtersLabels.genres')).toBeInTheDocument();
        expect(screen.queryByText('gamesLibrary.gamesGenres.1')).not.toBeInTheDocument();
        expect(onChange).not.toHaveBeenCalled();
    });

    it('removes selected ids that are not in the fetched genres from parent state', () => {
        render(<GenresSelect value={[999]} onChange={onChange} />);
        expect(screen.queryByText('gamesLibrary.gamesGenres.999')).not.toBeInTheDocument();
        expect(onChange).toHaveBeenCalledExactlyOnceWith([]);
    });

    it('reconciles selections when genres load and preserves valid ids in order', () => {
        getGenresQueryMock.mockReturnValue({ data: undefined, isFetching: true });
        const { rerender } = render(<GenresSelect value={[13, 999, 1]} onChange={onChange} />);
        expect(onChange).not.toHaveBeenCalled();

        getGenresQueryMock.mockReturnValue({ data: [{ id: 1 }, { id: 13 }], isFetching: false });
        rerender(<GenresSelect value={[13, 999, 1]} onChange={onChange} />);
        expect(onChange).toHaveBeenCalledExactlyOnceWith([13, 1]);

        rerender(<GenresSelect value={[13, 1]} onChange={onChange} />);
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('clears selected ids when the loaded genres are empty', () => {
        getGenresQueryMock.mockReturnValue({ data: [], isFetching: false });
        render(<GenresSelect value={[1]} onChange={onChange} />);
        expect(onChange).toHaveBeenCalledExactlyOnceWith([]);
    });

    it('clears all selected genres through the clear control', () => {
        render(<GenresSelect value={[1, 13]} onChange={onChange} />);
        expect(onChange).not.toHaveBeenCalled();
        fireEvent.click(screen.getByTitle('Clear'));
        expect(onChange).toHaveBeenCalledExactlyOnceWith([]);
    });

    it('does not call onChange on initial render', () => {
        render(<GenresSelect value={mockSelectedGenres} onChange={onChange} />);
        expect(onChange).not.toHaveBeenCalled();
    });
});
