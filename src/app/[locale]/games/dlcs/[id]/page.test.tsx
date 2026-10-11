import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { echoTranslations } from '@/test/mocks/nextIntl';

const { query, back, notFound } = vi.hoisted(() => ({ query: vi.fn(), back: vi.fn(), notFound: vi.fn() }));
vi.mock('next-intl', () => echoTranslations());
vi.mock('next/navigation', () => ({ notFound }));
vi.mock('@/i18n/routing', () => ({ useRouter: () => ({ back }) }));
vi.mock('@/redux/services/dlcsAPI', () => ({ useGetDlcQuery: query }));
vi.mock('@/features/games/components/CardGrid', () => ({
    CardGrid: ({ items, category }: { items: { id: string; title: string }[]; category: string }) =>
        <div data-testid="card-grid" data-category={category} data-ids={items.map(item => item.id).join(',')}>
            {items.map(item => item.title).join(',')}
        </div>,
}));

import DlcDetailPage from './page';

const group = {
    id: 'parent', name: 'Parent game', imagePath: '/covers/parent/cover.webp', dlcsCount: 3,
    items: [
        { id: 'b', title: 'Bravo', duration: '01:00:00' },
        { id: 'a', title: 'Alpha', duration: '03:00:00' },
        { id: 'c', title: 'Charlie', duration: '02:00:00' },
    ],
};
const renderDetail = async () => act(async () => render(<DlcDetailPage params={Promise.resolve({ id: 'parent' })} />));

describe('DlcDetailPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        query.mockReturnValue({ data: group, isLoading: false });
    });

    it('loads the string parent ID, counts DLCs, selects DLC entries and navigates back', async () => {
        await renderDetail();
        expect(query).toHaveBeenCalledWith('parent');
        expect(screen.getByText('Parent game')).toBeInTheDocument();
        expect(screen.getByText('dlcs.dlcsCount:{"count":3}')).toBeInTheDocument();
        expect(screen.getByTestId('card-grid')).toHaveAttribute('data-category', 'dlcs');
        fireEvent.click(screen.getByRole('button', { name: 'dlcs.back' }));
        expect(back).toHaveBeenCalledOnce();
        expect(screen.getAllByRole('option')).toHaveLength(4);
        expect(screen.queryByRole('option', { name: 'common.gameSort.tierAsc' })).not.toBeInTheDocument();
        expect(screen.queryByRole('option', { name: 'common.gameSort.tierDesc' })).not.toBeInTheDocument();
    });

    it.each([
        ['titleAsc', 'Alpha,Bravo,Charlie'], ['titleDesc', 'Charlie,Bravo,Alpha'],
        ['durationAsc', 'Bravo,Charlie,Alpha'], ['durationDesc', 'Alpha,Charlie,Bravo'],
    ])('sorts DLC entries by %s', async (sort, expected) => {
        await renderDetail();
        fireEvent.change(screen.getByLabelText('common.gameSort.label'), { target: { value: sort } });
        expect(screen.getByTestId('card-grid')).toHaveTextContent(expected);
    });

    it('sorts before pagination and resets the visible slice when sorting changes', async () => {
        const items = Array.from({ length: 14 }, (_, index) => ({ id: String(index), title: `DLC ${String(index).padStart(2, '0')}` }));
        query.mockReturnValue({ data: { ...group, items, dlcsCount: 14 } });
        await renderDetail();
        fireEvent.change(screen.getByLabelText('common.gameSort.label'), { target: { value: 'titleDesc' } });
        expect(screen.getByTestId('card-grid').textContent?.trim()).toBe(items.slice(2).reverse().map(item => item.title).join(','));
        fireEvent.click(screen.getByText('common.loadMore'));
        expect(screen.getByTestId('card-grid').textContent?.split(',')).toHaveLength(14);
        fireEvent.change(screen.getByLabelText('common.gameSort.label'), { target: { value: 'titleAsc' } });
        expect(screen.getByTestId('card-grid').textContent?.split(',')).toHaveLength(12);
    });

    it('shows loading and treats unknown groups as not found', async () => {
        query.mockReturnValue({ isLoading: true });
        const view = await renderDetail();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        query.mockReturnValue({ error: { status: 404 }, isLoading: false });
        await act(async () => view.rerender(<DlcDetailPage params={Promise.resolve({ id: 'missing' })} />));
        expect(notFound).toHaveBeenCalled();
    });

    it('offers retry for detail errors', async () => {
        const refetch = vi.fn();
        query.mockReturnValue({ error: { status: 500 }, isLoading: false, refetch });
        await renderDetail();
        fireEvent.click(screen.getByRole('button', { name: 'common.errors.retry' }));
        expect(refetch).toHaveBeenCalledOnce();
        expect(notFound).not.toHaveBeenCalled();
    });
});
