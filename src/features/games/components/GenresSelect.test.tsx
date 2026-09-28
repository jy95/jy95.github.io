import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

    it('renders no selected chip when no genre filter is active', () => {
        render(<GenresSelect value={mockSelectedGenres} onChange={onChange} />);
        expect(screen.queryByText('gamesLibrary.gamesGenres.1')).not.toBeInTheDocument();
    });

    it('shows a chip for a single selected genre, using the translated name', () => {
        mockSelectedGenres = [1];
        render(<GenresSelect value={mockSelectedGenres} onChange={onChange} />);
        expect(screen.getByText('gamesLibrary.gamesGenres.1')).toBeInTheDocument();
    });

    it('shows one chip per selected genre when multiple are active', () => {
        mockSelectedGenres = [1, 13];
        render(<GenresSelect value={mockSelectedGenres} onChange={onChange} />);
        expect(screen.getByText('gamesLibrary.gamesGenres.1')).toBeInTheDocument();
        expect(screen.getByText('gamesLibrary.gamesGenres.13')).toBeInTheDocument();
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
