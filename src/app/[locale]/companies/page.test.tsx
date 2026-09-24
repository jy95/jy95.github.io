import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { echoTranslations } from '@/test/mocks/nextIntl';

vi.mock('next-intl', () => echoTranslations());
const useCompaniesMock = vi.fn();
const { dispatchMock, updateQueryDataMock } = vi.hoisted(() => ({
    dispatchMock: vi.fn(),
    updateQueryDataMock: vi.fn((_name, _args, recipe) => recipe),
}));
vi.mock('@/redux/hooks', () => ({ useAppDispatch: () => dispatchMock }));
vi.mock('@/redux/services/companiesAPI', () => ({
    useGetCompaniesInfiniteQuery: (args: unknown) => useCompaniesMock(args),
    companiesAPI: { util: { updateQueryData: updateQueryDataMock } },
}));
vi.mock('@/features/companies/CompanyCard', () => ({
    default: ({ company }: { company: { title: string; gamesCount: number } }) =>
        <div data-testid="company-card">{company.title}:{company.gamesCount}</div>,
}));

import CompaniesGallery from './page';

const pages = [
    { items: [{ id: 1, name: 'Both', imagePath: '/companies/1/cover.webp', gamesCount: 2 }] },
    { items: [{ id: 2, name: 'Second', imagePath: '/companies/2/cover.webp', gamesCount: 1 }] },
];

describe('CompaniesGallery', () => {
    const fetchNextPage = vi.fn();
    beforeEach(() => {
        fetchNextPage.mockReset();
        dispatchMock.mockReset();
        updateQueryDataMock.mockClear();
        useCompaniesMock.mockReset().mockImplementation(({ role }) => ({
            data: { pages: role === 'publisher' ? [{ items: [{ id: 1, name: 'Both', imagePath: '/companies/1/cover.webp', gamesCount: 1 }] }] : pages },
            isFetching: false, isError: false, hasNextPage: true, fetchNextPage, refetch: vi.fn(),
        }));
    });

    it('shows loading and error states', () => {
        useCompaniesMock.mockReturnValueOnce({ data: undefined, isFetching: true, hasNextPage: false });
        const { rerender } = render(<CompaniesGallery />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        useCompaniesMock.mockReturnValueOnce({ data: undefined, isError: true, refetch: vi.fn() });
        rerender(<CompaniesGallery />);
        expect(screen.getByText('common.errors.generic')).toBeInTheDocument();
    });

    it('renders all loaded pages and fetches more', () => {
        render(<CompaniesGallery />);
        expect(screen.getAllByTestId('company-card')).toHaveLength(2);
        fireEvent.click(screen.getByText('common.loadMore'));
        expect(fetchNextPage).toHaveBeenCalledOnce();
        expect(useCompaniesMock).toHaveBeenCalledWith({ role: 'all', pageSize: 12 });
    });

    it('resets to the first page of the new role instead of keeping earlier role pages', () => {
        render(<CompaniesGallery />);
        fireEvent.click(screen.getByText('companies.roles.publisher'));
        expect(useCompaniesMock).toHaveBeenLastCalledWith({ role: 'publisher', pageSize: 12 });
        expect(updateQueryDataMock).toHaveBeenCalledWith('getCompanies', { role: 'publisher', pageSize: 12 }, expect.any(Function));
        expect(screen.getAllByTestId('company-card')).toHaveLength(1);
        expect(screen.getByText('Both:1')).toBeInTheDocument();
        const cached = { pages: [...pages], pageParams: [1, 2] };
        updateQueryDataMock.mock.calls[0][2](cached);
        expect(cached).toEqual({ pages: [pages[0]], pageParams: [1] });
    });
});
