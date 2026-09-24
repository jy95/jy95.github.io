import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';

const { notFoundMock } = vi.hoisted(() => ({ notFoundMock: vi.fn() }));
vi.mock('next/navigation', () => ({ notFound: notFoundMock }));

const useGetCompaniesQueryMock = vi.fn();
vi.mock('@/redux/services/companiesAPI', () => ({
    useGetCompaniesQuery: () => useGetCompaniesQueryMock(),
}));

vi.mock('@/features/games/components/CardGrid', () => ({
    CardGrid: ({ items }: { items: { id: string; title: string }[] }) => (
        <div data-testid="card-grid">{items.map((i) => i.title).join(',')}</div>
    ),
}));

import CompanyDetail from './page';

const company = {
    id: 1,
    name: 'Capcom',
    imagePath: '/companies/1/cover.webp',
    developerGames: [{ id: 'a', title: 'Game A' }, { id: 'b', title: 'Game B' }],
    publisherGames: [{ id: 'b', title: 'Game B' }, { id: 'c', title: 'Game C' }],
};

function paramsFor(id: string) {
    return Promise.resolve({ id });
}

describe('CompanyDetail', () => {
    beforeEach(() => {
        notFoundMock.mockReset();
        useGetCompaniesQueryMock.mockReset().mockReturnValue({
            data: [company],
            isLoading: false,
            error: undefined,
            refetch: vi.fn(),
        });
    });

    it('renders the company name as a heading', async () => {
        await act(async () => {
            render(<CompanyDetail params={paramsFor('1')} />);
        });
        expect(screen.getByText('Capcom')).toBeInTheDocument();
    });

    it('merges developer and publisher games, deduplicating by id', async () => {
        await act(async () => {
            render(<CompanyDetail params={paramsFor('1')} />);
        });
        const grid = screen.getByTestId('card-grid');
        // a, b, c — b appears in both lists but only once here
        expect(grid.textContent).toBe('Game A,Game B,Game C');
    });

    it('shows a loading spinner while the query is pending', async () => {
        useGetCompaniesQueryMock.mockReturnValue({ data: undefined, isLoading: true, error: undefined, refetch: vi.fn() });
        await act(async () => {
            render(<CompanyDetail params={paramsFor('1')} />);
        });
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('calls notFound when no company matches the given id', async () => {
        await act(async () => {
            render(<CompanyDetail params={paramsFor('999')} />);
        });
        expect(notFoundMock).toHaveBeenCalledOnce();
    });
});
