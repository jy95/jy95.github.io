import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { echoTranslations } from '@/test/mocks/nextIntl';
import en from '../../../../../messages/en.json';
import fr from '../../../../../messages/fr.json';

vi.mock('next-intl', () => echoTranslations());
const responsive = vi.hoisted(() => ({ mobile: false }));
vi.mock('@mui/material/useMediaQuery', () => ({ default: () => responsive.mobile }));
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
        responsive.mobile = false;
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
    it.each([false, true])('resets destination caches for fields, directions and debounced search (mobile: %s)', async mobile => {
        responsive.mobile = mobile;
        render(<SeriesGallery />);
        const chooseField = (field: 'name' | 'count') => {
            const select = screen.getByRole('combobox', { name: 'series.sortSeries.label' });
            expect(select.tagName).toBe(mobile ? 'SELECT' : 'DIV');
            if (mobile) fireEvent.change(select, { target: { value: field } });
            else {
                fireEvent.mouseDown(select);
                fireEvent.click(screen.getByRole('option', { name: `series.sortSeries.${field}` }));
            }
        };
        const expectDestination = (sort: string) => {
            expect(reset).toHaveBeenLastCalledWith({ filter: '', sort, pageSize: 12 });
            expect(dispatch).toHaveBeenCalledTimes(reset.mock.calls.length);
            expect(query).toHaveBeenLastCalledWith({ filter: '', sort, pageSize: 12 });
            expect(reset.mock.invocationCallOrder.at(-1)).toBeLessThan(query.mock.invocationCallOrder.at(-1) ?? 0);
        };
        expect(screen.getByTestId('ArrowUpwardIcon')).toHaveAttribute('aria-hidden', 'true');
        chooseField('count');
        expectDestination('countAsc');
        const descending = screen.getByRole('button', { name: 'series.sortSeries.direction.desc' });
        expect(descending).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
        fireEvent.click(descending);
        expectDestination('countDesc');
        expect(screen.getByTestId('ArrowDownwardIcon')).toBeInTheDocument();
        chooseField('name');
        expectDestination('nameDesc');
        fireEvent.click(screen.getByRole('button', { name: 'series.sortSeries.direction.asc' }));
        expectDestination('nameAsc');
        fireEvent.change(screen.getByLabelText('series.filter.label'), { target: { value: 'Batman' } });
        expect(query).toHaveBeenLastCalledWith({ filter: '', sort: 'nameAsc', pageSize: 12 });
        await waitFor(() => expect(reset).toHaveBeenLastCalledWith({ filter: 'Batman', sort: 'nameAsc', pageSize: 12 }));
        expect(query).toHaveBeenLastCalledWith({ filter: 'Batman', sort: 'nameAsc', pageSize: 12 });
    });
    it('bounds flexible toolbar controls and permits wrapping', () => {
        render(<SeriesGallery />);
        expect(screen.getByTestId('series-toolbar')).toHaveStyle({ display: 'flex', flexWrap: 'wrap', minWidth: '0' });
        const search = screen.getByTestId('series-search');
        const sort = screen.getByTestId('series-sort');
        expect(search).toContainElement(screen.getByLabelText('series.filter.label'));
        expect(search).toHaveStyle({ minWidth: '0' });
        expect(sort).toHaveStyle({ minWidth: '0' });
        // jsdom does not apply media queries; inspect the generated desktop rules.
        const styles = Array.from(document.styleSheets).flatMap(sheet => Array.from(sheet.cssRules, rule => rule.cssText)).join('').replace(/:\s+/g, ':');
        expect(styles).toContain('flex:1 1 100%');
        expect(styles).toContain('flex:1 1 160px');
        expect(styles).toContain('max-width:240px');
        expect(styles).toContain('flex:1 1 300px');
        expect(styles).toContain('max-width:560px');
        expect(styles).toContain('flex:0 0 280px');
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
        expect(Object.keys(en.series.sortSeries)).toEqual(Object.keys(fr.series.sortSeries));
        for (const messages of [en, fr]) {
            expect(messages.series.sortSeries.name).toBeTruthy();
            expect(messages.series.sortSeries.count).toBeTruthy();
            expect(messages.series.sortSeries.direction.asc).not.toBe(messages.series.sortSeries.direction.desc);
        }
    });
});
