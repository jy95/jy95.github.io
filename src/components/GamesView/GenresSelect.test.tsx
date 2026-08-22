import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next-intl', () => ({
    useTranslations: (ns?: string) => (key: string) => (ns ? `${ns}.${key}` : key),
}));

const dispatchMock = vi.fn();
let mockSelectedGenres: number[] = [];

vi.mock('@/redux/hooks', () => ({
    useAppDispatch: () => dispatchMock,
    useAppSelector: (selector: any) =>
        selector({
            games: {
                activeFilters: mockSelectedGenres.length
                    ? [{ key: 'selected_genres', value: mockSelectedGenres }]
                    : [],
            },
        }),
}));

const getGenresQueryMock = vi.fn();
vi.mock('@/redux/services/genresAPI', () => ({
    useGetGenresQuery: () => getGenresQueryMock(),
}));

import GenresSelect from './GenresSelect';

describe('GenresSelect', () => {
    beforeEach(() => {
        dispatchMock.mockReset();
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
        render(<GenresSelect />);
        expect(screen.getByLabelText('gamesLibrary.filtersLabels.genres')).toBeInTheDocument();
    });

    it('renders no selected chip when no genre filter is active', () => {
        render(<GenresSelect />);
        expect(screen.queryByText('gamesLibrary.gamesGenres.1')).not.toBeInTheDocument();
    });

    it('shows a chip for a single selected genre, using the translated name', () => {
        mockSelectedGenres = [1];
        render(<GenresSelect />);
        expect(screen.getByText('gamesLibrary.gamesGenres.1')).toBeInTheDocument();
    });

    it('shows one chip per selected genre when multiple are active', () => {
        mockSelectedGenres = [1, 13];
        render(<GenresSelect />);
        expect(screen.getByText('gamesLibrary.gamesGenres.1')).toBeInTheDocument();
        expect(screen.getByText('gamesLibrary.gamesGenres.13')).toBeInTheDocument();
    });

    it('does not crash and renders no chips while genres data is still loading', () => {
        getGenresQueryMock.mockReturnValue({ data: undefined, isFetching: true });
        render(<GenresSelect />);
        expect(screen.getByLabelText('gamesLibrary.filtersLabels.genres')).toBeInTheDocument();
    });

    it('does not dispatch anything on initial render', () => {
        render(<GenresSelect />);
        expect(dispatchMock).not.toHaveBeenCalled();
    });
});
