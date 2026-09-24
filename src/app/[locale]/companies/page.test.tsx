import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { echoTranslations } from '@/test/mocks/nextIntl';
import en from '../../../../messages/en.json';
import fr from '../../../../messages/fr.json';

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
        expect(useCompaniesMock).toHaveBeenCalledWith({ role: 'all', sort: 'nameAsc', pageSize: 12 });
    });

    it('keeps the role toggle left and the sort select right in a wrapping row', () => {
        render(<CompaniesGallery />);
        const controls = screen.getByTestId('companies-controls');
        expect(controls).toContainElement(screen.getByText('companies.roles.all'));
        expect(controls).toContainElement(screen.getByLabelText('companies.sortCompanies.label'));
        expect(getComputedStyle(controls).justifyContent).toBe('space-between');
        expect(getComputedStyle(controls).flexWrap).toBe('wrap');
    });

    it('offers game count ascending with English and French labels', () => {
        render(<CompaniesGallery />);
        expect(screen.getByRole('option', { name: 'companies.sortCompanies.countAsc' })).toHaveValue('countAsc');
        expect(en.companies.sortCompanies.countAsc).toBe('Game count (fewest first)');
        expect(fr.companies.sortCompanies.countAsc).toBe('Nombre de jeux (croissant)');
    });

    it('resets to the first page of the new role instead of keeping earlier role pages', () => {
        render(<CompaniesGallery />);
        fireEvent.click(screen.getByText('companies.roles.publisher'));
        expect(useCompaniesMock).toHaveBeenLastCalledWith({ role: 'publisher', sort: 'nameAsc', pageSize: 12 });
        expect(updateQueryDataMock).toHaveBeenCalledWith('getCompanies', { role: 'publisher', sort: 'nameAsc', pageSize: 12 }, expect.any(Function));
        expect(screen.getAllByTestId('company-card')).toHaveLength(1);
        expect(screen.getByText('Both:1')).toBeInTheDocument();
        const cached = { pages: [...pages], pageParams: [1, 2] };
        updateQueryDataMock.mock.calls[0][2](cached);
        expect(cached).toEqual({ pages: [pages[0]], pageParams: [1] });
    });

    it('resets the selected sort query to page one, including when switching role', () => {
        render(<CompaniesGallery />);
        fireEvent.change(screen.getByLabelText('companies.sortCompanies.label'), { target: { value: 'countDesc' } });
        expect(useCompaniesMock).toHaveBeenLastCalledWith({ role: 'all', sort: 'countDesc', pageSize: 12 });
        expect(updateQueryDataMock).toHaveBeenCalledWith('getCompanies', { role: 'all', sort: 'countDesc', pageSize: 12 }, expect.any(Function));
        fireEvent.click(screen.getByText('companies.roles.developer'));
        expect(useCompaniesMock).toHaveBeenLastCalledWith({ role: 'developer', sort: 'countDesc', pageSize: 12 });
        expect(updateQueryDataMock).toHaveBeenCalledWith('getCompanies', { role: 'developer', sort: 'countDesc', pageSize: 12 }, expect.any(Function));
        const cached = { pages: [...pages], pageParams: [1, 2] };
        updateQueryDataMock.mock.calls[0][2](cached);
        expect(cached.pageParams).toEqual([1]);
    });

    it('keeps count ascending when changing roles and resets loaded pages', () => {
        render(<CompaniesGallery />);
        fireEvent.change(screen.getByLabelText('companies.sortCompanies.label'), { target: { value: 'countAsc' } });
        expect(useCompaniesMock).toHaveBeenLastCalledWith({ role: 'all', sort: 'countAsc', pageSize: 12 });
        expect(updateQueryDataMock).toHaveBeenCalledWith('getCompanies', { role: 'all', sort: 'countAsc', pageSize: 12 }, expect.any(Function));
        fireEvent.click(screen.getByText('companies.roles.publisher'));
        expect(useCompaniesMock).toHaveBeenLastCalledWith({ role: 'publisher', sort: 'countAsc', pageSize: 12 });
        const cached = { pages: [...pages], pageParams: [1, 2] };
        updateQueryDataMock.mock.calls[1][2](cached);
        expect(cached).toEqual({ pages: [pages[0]], pageParams: [1] });
    });
});
