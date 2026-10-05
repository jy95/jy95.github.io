import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { echoTranslations } from '@/test/mocks/nextIntl';

const { notFoundMock, backMock } = vi.hoisted(() => ({ notFoundMock: vi.fn(), backMock: vi.fn() }));
vi.mock('next/navigation', () => ({ notFound: notFoundMock }));
vi.mock('@/i18n/routing', () => ({ useRouter: () => ({ back: backMock }) }));
vi.mock('next-intl', () => echoTranslations());
const useGetCompanyQueryMock = vi.fn();
vi.mock('@/redux/services/companiesAPI', () => ({ useGetCompanyQuery: (id: string) => useGetCompanyQueryMock(id) }));
vi.mock('@/features/games/components/CardGrid', () => ({
    CardGrid: ({ items }: { items: { id: string; title: string }[] }) =>
        <div data-testid="card-grid" data-ids={items.map((item) => item.id).join(',')}>{items.map((item) => item.title).join(',')}</div>,
}));

import CompanyDetail from './page';

const game = (id: string, title: string, duration: string | undefined, tierCategory: string) => ({ id, title, duration, tierCategory });
const company = {
    id: 1, name: 'Capcom', imagePath: '/companies/1/cover.webp',
    developerGames: [game('b', 'Bravo', '01:00:00', 'tier_good'), game('a', 'Alpha', '03:00:00', 'tier_bad')],
    publisherGames: [game('b', 'Bravo', '01:00:00', 'tier_good'), game('c', 'Charlie', '02:00:00', 'tier_masterpiece')],
};

async function renderDetail(data = company) {
    useGetCompanyQueryMock.mockReturnValue({ data, isLoading: false, error: undefined, refetch: vi.fn() });
    await act(async () => { render(<CompanyDetail params={Promise.resolve({ id: '1' })} />); });
}

describe('CompanyDetail', () => {
    beforeEach(() => { useGetCompanyQueryMock.mockReset(); notFoundMock.mockReset(); backMock.mockReset(); });

    it('loads the company by ID, merges duplicate games, and navigates back', async () => {
        await renderDetail();
        expect(useGetCompanyQueryMock).toHaveBeenCalledWith('1');
        expect(screen.getByText('Capcom')).toBeInTheDocument();
        expect(screen.getByTestId('entity-header')).toContainElement(screen.getByText('Capcom'));
        expect(screen.getByTestId('entity-header')).toContainElement(screen.getByRole('button', { name: 'companies.back' }));
        expect(getComputedStyle(screen.getByTestId('entity-header')).flexWrap).toBe('wrap');
        const controls = screen.getByTestId('entity-sort-controls');
        expect(controls).toContainElement(screen.getByLabelText('companies.sort.label'));
        expect(getComputedStyle(controls).justifyContent).toBe('flex-end');
        expect(getComputedStyle(controls).flexWrap).toBe('wrap');
        expect(screen.getByTestId('card-grid')).toHaveTextContent('Alpha,Bravo,Charlie');
        fireEvent.click(screen.getByRole('button', { name: 'companies.back' }));
        expect(backMock).toHaveBeenCalledOnce();
        expect(screen.getByLabelText('companies.sort.label')).toHaveValue('titleAsc');
    });

    it('keeps the publisher entry when a game ID appears in both roles', async () => {
        await renderDetail({ ...company,
            developerGames: [game('same', 'Developer version', '01:00:00', 'tier_good')],
            publisherGames: [game('same', 'Publisher version', '02:00:00', 'tier_bad')],
        });
        expect(screen.getByTestId('card-grid')).toHaveAttribute('data-ids', 'same');
        expect(screen.getByTestId('card-grid')).toHaveTextContent('Publisher version');
        expect(screen.queryByText('Developer version')).not.toBeInTheDocument();
    });

    it('shows loading and treats 404 as not found', async () => {
        useGetCompanyQueryMock.mockReturnValueOnce({ isLoading: true });
        await act(async () => { render(<CompanyDetail params={Promise.resolve({ id: '1' })} />); });
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        useGetCompanyQueryMock.mockReturnValue({ error: { status: 404 }, isLoading: false });
        await act(async () => { render(<CompanyDetail params={Promise.resolve({ id: '999' })} />); });
        expect(notFoundMock).toHaveBeenCalled();
    });

    it.each([
        ['titleAsc', 'Alpha,Bravo,Charlie'],
        ['titleDesc', 'Charlie,Bravo,Alpha'],
        ['durationAsc', 'Bravo,Charlie,Alpha'],
        ['durationDesc', 'Alpha,Charlie,Bravo'],
        ['tierAsc', 'Charlie,Bravo,Alpha'],
        ['tierDesc', 'Alpha,Bravo,Charlie'],
    ])('sorts all games by %s', async (option, expected) => {
        await renderDetail();
        fireEvent.change(screen.getByLabelText('companies.sort.label'), { target: { value: option } });
        expect(screen.getByLabelText('companies.sort.label')).toHaveValue(option);
        expect(screen.getByTestId('card-grid')).toHaveTextContent(expected);
    });

    it('sorts before loading more and resets pagination on sort change', async () => {
        const many = Array.from({ length: 14 }, (_, index) => game(String(index), `Game ${String(index).padStart(2, '0')}`, `${String(index).padStart(2, '0')}:00:00`, 'tier_good'));
        await renderDetail({ ...company, developerGames: many, publisherGames: [many[0]] });
        fireEvent.change(screen.getByLabelText('companies.sort.label'), { target: { value: 'titleDesc' } });
        expect(screen.getByTestId('card-grid').textContent?.split(',')).toEqual(many.slice(2).reverse().map((item) => item.title));
        fireEvent.click(screen.getByText('common.loadMore'));
        expect(screen.getByTestId('card-grid').textContent?.split(',')).toHaveLength(14);
        fireEvent.change(screen.getByLabelText('companies.sort.label'), { target: { value: 'durationAsc' } });
        expect(screen.getByTestId('card-grid').textContent?.split(',')).toHaveLength(12);
        fireEvent.click(screen.getByText('common.loadMore'));
        expect(screen.getByTestId('card-grid').textContent?.split(',')).toHaveLength(14);
        fireEvent.change(screen.getByLabelText('companies.sort.label'), { target: { value: 'durationDesc' } });
        expect(screen.getByTestId('card-grid').textContent?.split(',')).toHaveLength(12);
    });

    it('breaks equal titles by game ID regardless of source ordering', async () => {
        await renderDetail({ ...company, developerGames: [game('b', 'Same', '01:00:00', 'tier_good'), game('a', 'Same', '01:00:00', 'tier_good')], publisherGames: [] });
        expect(screen.getByTestId('card-grid')).toHaveAttribute('data-ids', 'a,b');
        fireEvent.change(screen.getByLabelText('companies.sort.label'), { target: { value: 'titleDesc' } });
        expect(screen.getByTestId('card-grid')).toHaveAttribute('data-ids', 'a,b');
    });
    it('sorts missing durations as zero and retains ascending title tie-breakers', async () => {
        await renderDetail({ ...company, developerGames: [game('b', 'Bravo', undefined, 'tier_good'), game('a', 'Alpha', undefined, 'tier_good'), game('c', 'Charlie', '01:00:00', 'tier_good')], publisherGames: [] });
        fireEvent.change(screen.getByLabelText('companies.sort.label'), { target: { value: 'durationAsc' } });
        expect(screen.getByTestId('card-grid')).toHaveAttribute('data-ids', 'a,b,c');
        fireEvent.change(screen.getByLabelText('companies.sort.label'), { target: { value: 'durationDesc' } });
        expect(screen.getByTestId('card-grid')).toHaveAttribute('data-ids', 'c,a,b');
    });

    it('resets pagination when company data changes', async () => {
        const many = Array.from({ length: 14 }, (_, index) => game(String(index), `Game ${index}`, '01:00:00', 'tier_good'));
        const data = { ...company, developerGames: many, publisherGames: [] };
        useGetCompanyQueryMock.mockReturnValue({ data, isLoading: false });
        const params = Promise.resolve({ id: '1' });
        const view = await act(async () => render(<CompanyDetail params={params} />));
        fireEvent.click(screen.getByText('common.loadMore'));
        expect(screen.getByTestId('card-grid').textContent?.split(',')).toHaveLength(14);
        useGetCompanyQueryMock.mockReturnValue({ data: { ...data, developerGames: [...many] }, isLoading: false });
        await act(async () => view.rerender(<CompanyDetail params={params} />));
        expect(screen.getByTestId('card-grid').textContent?.split(',')).toHaveLength(12);
    });

});
