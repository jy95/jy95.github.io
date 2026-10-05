import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { echoTranslations } from '@/test/mocks/nextIntl';
import en from '../../../../../messages/en.json';
import fr from '../../../../../messages/fr.json';

vi.mock('next-intl', () => echoTranslations());
const { query, reset, dispatch } = vi.hoisted(() => ({ query: vi.fn(), reset: vi.fn(), dispatch: vi.fn() }));
vi.mock('@/redux/hooks', () => ({ useAppDispatch: () => dispatch }));
vi.mock('@/redux/services/seriesAPI', () => ({ useGetSeriesInfiniteQuery: query, resetPages: reset }));
vi.mock('@/features/series/SeriesCard', () => ({ default: ({ series }: { series: { name: string } }) => <div>{series.name}</div> }));
import SeriesGallery from './page';

describe('SeriesGallery', () => {
    const fetchNextPage = vi.fn();
    const refetch = vi.fn();
    beforeEach(() => {
        vi.clearAllMocks();
        query.mockReturnValue({ data: { pages: [{ items: [{ id: 1, name: 'Batman' }], total_items: 2 }, { items: [{ id: 2, name: 'Zelda' }] }] }, hasNextPage: true, fetchNextPage, refetch });
    });
    it('renders loaded pages and requests another page', () => {
        render(<SeriesGallery />);
        expect(screen.getByText('Batman')).toBeInTheDocument();
        expect(screen.getByText('Zelda')).toBeInTheDocument();
        fireEvent.click(screen.getByText('common.loadMore'));
        expect(fetchNextPage).toHaveBeenCalledOnce();
        expect(query).toHaveBeenCalledWith({ filter: '', sort: 'nameAsc', pageSize: 12 });
    });
    it('resets destination caches on native sort and debounced filtering changes', async () => {
        render(<SeriesGallery />);
        fireEvent.change(screen.getByLabelText('series.sortSeries.label'), { target: { value: 'countAsc' } });
        expect(reset).toHaveBeenCalledWith({ filter: '', sort: 'countAsc', pageSize: 12 });
        fireEvent.change(screen.getByLabelText('series.filter.label'), { target: { value: 'Batman' } });
        await waitFor(() => expect(reset).toHaveBeenCalledWith({ filter: 'Batman', sort: 'countAsc', pageSize: 12 }));
        expect(query).toHaveBeenLastCalledWith({ filter: 'Batman', sort: 'countAsc', pageSize: 12 });
    });
    it('shows loading, empty and retryable errors', () => {
        query.mockReturnValueOnce({ isFetching: true });
        const view = render(<SeriesGallery />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        query.mockReturnValueOnce({ data: { pages: [{ items: [], total_items: 0 }] } });
        view.rerender(<SeriesGallery />);
        expect(screen.getByText('series.empty')).toBeInTheDocument();
        query.mockReturnValueOnce({ isError: true, refetch });
        view.rerender(<SeriesGallery />);
        fireEvent.click(screen.getByText('common.errors.retry'));
        expect(refetch).toHaveBeenCalledOnce();
    });
    it('provides matching locale keys and plural counts', () => {
        expect(Object.keys(en.series)).toEqual(Object.keys(fr.series));
        expect(en.series.gamesCount).toContain('plural');
        expect(fr.series.gamesCount).toContain('plural');
        expect(Object.keys(en.series.sort)).toEqual(Object.keys(fr.series.sort));
    });
});
