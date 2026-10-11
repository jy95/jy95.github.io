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
vi.mock('@/redux/services/dlcsAPI', () => ({ useGetDlcsInfiniteQuery: query, resetDlcPages: reset }));
vi.mock('@/features/dlcs/DlcCard', () => ({ default: ({ group }: { group: { name: string } }) => <div>{group.name}</div> }));
import DlcGallery from './page';

describe('DlcGallery', () => {
    const fetchNextPage = vi.fn();
    const refetch = vi.fn();
    beforeEach(() => {
        vi.clearAllMocks();
        responsive.mobile = false;
        query.mockReturnValue({ currentData: { pages: [{ items: [{ id: "parent-1", name: 'Batman' }], total_items: 2 }, { items: [{ id: "parent-2", name: 'Zelda' }] }] }, hasNextPage: true, fetchNextPage, refetch });
    });
    it('renders loaded pages and requests another page', () => {
        render(<DlcGallery />);
        expect(screen.getByText('Batman')).toBeInTheDocument();
        expect(screen.getByText('Zelda')).toBeInTheDocument();
        fireEvent.click(screen.getByText('common.loadMore'));
        expect(fetchNextPage).toHaveBeenCalledOnce();
        expect(query).toHaveBeenCalledWith({ filter: '', sort: 'nameAsc', pageSize: 12 });
    });
    it.each([false, true])('resets destination caches for fields, directions and debounced search (mobile: %s)', async mobile => {
        responsive.mobile = mobile;
        render(<DlcGallery />);
        const chooseField = (field: 'name' | 'count') => {
            const select = screen.getByRole('combobox', { name: 'dlcs.sortDlcs.label' });
            expect(select.tagName).toBe(mobile ? 'SELECT' : 'DIV');
            if (mobile) fireEvent.change(select, { target: { value: field } });
            else {
                fireEvent.mouseDown(select);
                fireEvent.click(screen.getByRole('option', { name: `common.sort.fields.${field}` }));
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
        const descending = screen.getByRole('button', { name: 'common.sort.direction.desc' });
        expect(descending).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
        fireEvent.click(descending);
        expectDestination('countDesc');
        expect(screen.getByTestId('ArrowDownwardIcon')).toBeInTheDocument();
        chooseField('name');
        expectDestination('nameDesc');
        fireEvent.click(screen.getByRole('button', { name: 'common.sort.direction.asc' }));
        expectDestination('nameAsc');
        fireEvent.change(screen.getByLabelText('dlcs.filter.label'), { target: { value: 'Batman' } });
        expect(query).toHaveBeenLastCalledWith({ filter: '', sort: 'nameAsc', pageSize: 12 });
        await waitFor(() => expect(reset).toHaveBeenLastCalledWith({ filter: 'Batman', sort: 'nameAsc', pageSize: 12 }));
        expect(query).toHaveBeenLastCalledWith({ filter: 'Batman', sort: 'nameAsc', pageSize: 12 });
    });
    it('bounds flexible toolbar controls and permits wrapping', () => {
        render(<DlcGallery />);
        expect(screen.getByTestId('dlcs-toolbar')).toHaveStyle({ display: 'flex', flexWrap: 'wrap', minWidth: '0' });
        const search = screen.getByTestId('dlcs-search');
        const sort = screen.getByTestId('dlcs-sort');
        expect(search).toContainElement(screen.getByLabelText('dlcs.filter.label'));
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
        const view = render(<DlcGallery />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        query.mockReturnValueOnce({ currentData: { pages: [{ items: [], total_items: 0 }] } });
        view.rerender(<DlcGallery />);
        expect(screen.getByText('dlcs.empty')).toBeInTheDocument();
        query.mockReturnValueOnce({ isError: true, refetch });
        view.rerender(<DlcGallery />);
        fireEvent.click(screen.getByText('common.errors.retry'));
        expect(refetch).toHaveBeenCalledOnce();
    });
    it.each([
        ['filter', false],
        ['filter', true],
        ['sort', false],
        ['sort', true],
    ] as const)('hides retained %s results (empty: %s) while new arguments load or fail', async (change, empty) => {
        const previousData = { pages: [{ items: empty ? [] : [{ id: "parent-1", name: 'Previous dlcs' }], total_items: empty ? 0 : 1 }] };
        let failed = false;
        query.mockImplementation(({ filter, sort }: { filter: string; sort: string }) => {
            const changed = change === 'filter' ? filter === 'New dlcs' : sort === 'nameDesc';
            return {
                data: previousData,
                currentData: changed ? undefined : previousData,
                isFetching: changed && !failed,
                isError: changed && failed,
                hasNextPage: !changed,
                fetchNextPage,
                refetch,
            };
        });
        const view = render(<DlcGallery />);
        expect(screen.getByText(empty ? 'dlcs.empty' : 'Previous dlcs')).toBeInTheDocument();
        if (change === 'filter') {
            fireEvent.change(screen.getByLabelText('dlcs.filter.label'), { target: { value: 'New dlcs' } });
            await waitFor(() => expect(query).toHaveBeenLastCalledWith({ filter: 'New dlcs', sort: 'nameAsc', pageSize: 12 }));
        } else {
            fireEvent.click(screen.getByRole('button', { name: 'common.sort.direction.desc' }));
            expect(query).toHaveBeenLastCalledWith({ filter: '', sort: 'nameDesc', pageSize: 12 });
        }
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.queryByText('Previous dlcs')).not.toBeInTheDocument();
        expect(screen.queryByText('dlcs.empty')).not.toBeInTheDocument();
        expect(screen.queryByText('common.errors.generic')).not.toBeInTheDocument();

        failed = true;
        view.rerender(<DlcGallery />);
        expect(screen.getByText('common.errors.generic')).toBeInTheDocument();
        expect(screen.queryByText('Previous dlcs')).not.toBeInTheDocument();
        expect(screen.queryByText('dlcs.empty')).not.toBeInTheDocument();
        expect(screen.queryByText('common.loadMore')).not.toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'common.errors.retry' }));
        expect(refetch).toHaveBeenCalledOnce();
    });
    it.each([false, true])('uses currentData for cards and empty results when data differs (empty: %s)', empty => {
        query.mockReturnValue({
            data: { pages: [{ items: empty ? [{ id: "parent-1", name: 'Previous dlcs' }] : [], total_items: empty ? 1 : 0 }] },
            currentData: { pages: [{ items: empty ? [] : [{ id: "parent-2", name: 'Current dlcs' }], total_items: empty ? 0 : 1 }] },
        });
        render(<DlcGallery />);
        expect(screen.queryByText('Previous dlcs')).not.toBeInTheDocument();
        if (empty) {
            expect(screen.getByText('dlcs.empty')).toBeInTheDocument();
            expect(screen.queryByText('Current dlcs')).not.toBeInTheDocument();
        } else {
            expect(screen.getByText('Current dlcs')).toBeInTheDocument();
            expect(screen.queryByText('dlcs.empty')).not.toBeInTheDocument();
        }
    });
    it('retains current pages and offers retry after a pagination error', () => {
        query.mockReturnValue({
            data: { pages: [{ items: [{ id: "parent-1", name: 'Previous dlcs' }], total_items: 1 }] },
            currentData: { pages: [{ items: [{ id: "parent-2", name: 'Current dlcs' }], total_items: 2 }, { items: [{ id: "parent-3", name: 'Next dlcs' }] }] },
            isError: true, hasNextPage: true, fetchNextPage, refetch,
        });
        render(<DlcGallery />);
        expect(screen.getByText('Current dlcs')).toBeInTheDocument();
        expect(screen.getByText('Next dlcs')).toBeInTheDocument();
        expect(screen.queryByText('Previous dlcs')).not.toBeInTheDocument();
        expect(screen.queryByText('dlcs.empty')).not.toBeInTheDocument();
        expect(screen.getByText('common.errors.generic')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'common.errors.retry' }));
        expect(refetch).toHaveBeenCalledOnce();
        fireEvent.click(screen.getByRole('button', { name: 'common.loadMore' }));
        expect(fetchNextPage).toHaveBeenCalledOnce();
    });
    it('provides matching locale keys and plural counts', () => {
        expect(Object.keys(en.dlcs)).toEqual(Object.keys(fr.dlcs));
        expect(en.dlcs.dlcsCount).toContain('plural');
        expect(fr.dlcs.dlcsCount).toContain('plural');
        expect(Object.keys(en.common.gameSort)).toEqual(Object.keys(fr.common.gameSort));
        expect(Object.keys(en.dlcs.sortDlcs)).toEqual(Object.keys(fr.dlcs.sortDlcs));
        for (const messages of [en, fr]) {
            expect(messages.common.sort.fields.name).toBeTruthy();
            expect(messages.common.sort.fields.count).toBeTruthy();
            expect(messages.common.sort.direction.asc).not.toBe(messages.common.sort.direction.desc);
        }
    });
});
