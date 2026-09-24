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
        <div data-testid="card-grid">{items.map((item) => item.title).join(',')}</div>,
}));

import CompanyDetail from './page';

const game = (id: string, title: string, duration: string, tierCategory: string) => ({ id, title, duration, tierCategory });
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
        expect(screen.getByTestId('card-grid')).toHaveTextContent('Alpha,Bravo,Charlie');
        fireEvent.click(screen.getByRole('button', { name: 'companies.back' }));
        expect(backMock).toHaveBeenCalledOnce();
        expect(screen.getByRole('button', { name: 'companies.sort.descending' })).toBeInTheDocument();
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
        ['title', false, 'Alpha,Bravo,Charlie'],
        ['title', true, 'Charlie,Bravo,Alpha'],
        ['duration', false, 'Bravo,Charlie,Alpha'],
        ['duration', true, 'Alpha,Charlie,Bravo'],
        ['tier', false, 'Charlie,Bravo,Alpha'],
        ['tier', true, 'Alpha,Bravo,Charlie'],
    ])('sorts all games by %s descending=%s', async (field, descending, expected) => {
        await renderDetail();
        fireEvent.change(screen.getByLabelText('companies.sort.label'), { target: { value: field } });
        if (descending) {
            fireEvent.click(screen.getByRole('button', { name: 'companies.sort.descending' }));
            expect(screen.getByRole('button', { name: 'companies.sort.ascending' })).toBeInTheDocument();
        }
        expect(screen.getByTestId('card-grid')).toHaveTextContent(expected);
    });

    it('sorts before loading more and resets pagination on sort change', async () => {
        const many = Array.from({ length: 14 }, (_, index) => game(String(index), `Game ${String(index).padStart(2, '0')}`, `${String(index).padStart(2, '0')}:00:00`, 'tier_good'));
        await renderDetail({ ...company, developerGames: many, publisherGames: [many[0]] });
        fireEvent.click(screen.getByRole('button', { name: 'companies.sort.descending' }));
        expect(screen.getByTestId('card-grid').textContent?.split(',')).toEqual(many.slice(2).reverse().map((item) => item.title));
        fireEvent.click(screen.getByText('common.loadMore'));
        expect(screen.getByTestId('card-grid').textContent?.split(',')).toHaveLength(14);
        fireEvent.change(screen.getByLabelText('companies.sort.label'), { target: { value: 'duration' } });
        expect(screen.getByTestId('card-grid').textContent?.split(',')).toHaveLength(12);
        fireEvent.click(screen.getByText('common.loadMore'));
        expect(screen.getByTestId('card-grid').textContent?.split(',')).toHaveLength(14);
        fireEvent.click(screen.getByRole('button', { name: 'companies.sort.ascending' }));
        expect(screen.getByTestId('card-grid').textContent?.split(',')).toHaveLength(12);
    });
});
