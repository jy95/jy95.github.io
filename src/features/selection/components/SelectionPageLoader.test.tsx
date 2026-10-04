import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import SelectionPageLoader from './SelectionPageLoader';
const query = vi.hoisted(() => vi.fn());
vi.mock('@/redux/services/selectionAPI', () => ({ useGetSelectionCatalogueQuery: query }));
vi.mock('./SelectionPage', () => ({ default: ({ catalogue }: { catalogue: unknown[] }) => <div>Catalogue: {catalogue.length}</div> }));
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
it('renders loading', () => { query.mockReturnValue({ isLoading: true }); render(<SelectionPageLoader />); expect(screen.getByRole('progressbar')).toBeInTheDocument(); });
it('passes successful data', () => { query.mockReturnValue({ data: [], isLoading: false }); render(<SelectionPageLoader />); expect(screen.getByText('Catalogue: 0')).toBeInTheDocument(); });
it('renders an error and retries', () => {
    const refetch = vi.fn(); query.mockReturnValue({ error: { status: 500 }, refetch });
    render(<SelectionPageLoader />); expect(screen.getByText('generic')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'retry' })); expect(refetch).toHaveBeenCalledOnce();
});
