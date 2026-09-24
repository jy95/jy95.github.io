import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { echoTranslations } from '@/test/mocks/nextIntl';

vi.mock('next-intl', () => echoTranslations());

const useGetCompaniesQueryMock = vi.fn();
vi.mock('@/redux/services/companiesAPI', () => ({
    useGetCompaniesQuery: () => useGetCompaniesQueryMock(),
}));

vi.mock('@/features/companies/CompanyCard', () => ({
    default: ({ company }: { company: { title: string; gamesCount: number } }) => (
        <div data-testid="company-card">{company.title}:{company.gamesCount}</div>
    ),
}));

import CompaniesGallery from './page';

const capcom = {
    id: 1,
    name: 'Capcom',
    imagePath: '/companies/1/cover.webp',
    developerGames: [{ id: 'a', title: 'Game A' }, { id: 'b', title: 'Game B' }],
    publisherGames: [{ id: 'b', title: 'Game B' }], // overlap: same game as dev+pub
};

const insomniac = {
    id: 2,
    name: 'Insomniac Games',
    imagePath: '/companies/2/cover.webp',
    developerGames: [{ id: 'c', title: 'Game C' }],
    publisherGames: [],
};

describe('CompaniesGallery', () => {
    beforeEach(() => {
        useGetCompaniesQueryMock.mockReset().mockReturnValue({
            data: [capcom, insomniac],
            isLoading: false,
            error: undefined,
            refetch: vi.fn(),
        });
    });

    it('shows a loading spinner while companies are loading', () => {
        useGetCompaniesQueryMock.mockReturnValue({ data: undefined, isLoading: true, error: undefined, refetch: vi.fn() });
        render(<CompaniesGallery />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders QueryErrorState when the query fails', () => {
        useGetCompaniesQueryMock.mockReturnValue({ data: undefined, isLoading: false, error: new Error('boom'), refetch: vi.fn() });
        render(<CompaniesGallery />);
        expect(screen.getByText('common.errors.generic')).toBeInTheDocument();
    });

    it('renders one card per company by default ("all" role), deduplicating dev+pub overlap', () => {
        render(<CompaniesGallery />);
        // Capcom: 2 unique games (a, b) despite b appearing in both dev and pub lists
        expect(screen.getByText('Capcom:2')).toBeInTheDocument();
        expect(screen.getByText('Insomniac Games:1')).toBeInTheDocument();
    });

    it('filters to developer-only counts when the developer toggle is selected', () => {
        render(<CompaniesGallery />);
        fireEvent.click(screen.getByText('companies.roles.developer'));
        expect(screen.getByText('Capcom:2')).toBeInTheDocument();
        expect(screen.getByText('Insomniac Games:1')).toBeInTheDocument();
    });

    it('filters to publisher-only counts when the publisher toggle is selected', () => {
        render(<CompaniesGallery />);
        fireEvent.click(screen.getByText('companies.roles.publisher'));
        expect(screen.getByText('Capcom:1')).toBeInTheDocument();
        // Insomniac has no publisher games, so it's excluded entirely (gamesCount > 0 filter)
        expect(screen.queryByText(/Insomniac Games:/)).not.toBeInTheDocument();
    });

    it('excludes a company entirely once its filtered games count reaches zero', () => {
        render(<CompaniesGallery />);
        fireEvent.click(screen.getByText('companies.roles.publisher'));
        expect(screen.getAllByTestId('company-card')).toHaveLength(1);
    });
});
