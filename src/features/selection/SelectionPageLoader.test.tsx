import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import SelectionPageLoader from './SelectionPageLoader';

const query = vi.hoisted(() => vi.fn());
vi.mock('@/redux/services/selectionAPI', () => ({ useGetSelectionCatalogueQuery: query }));
vi.mock('./SelectionPage', () => ({ default: ({ catalogue }: { catalogue: unknown[] }) => <div>Catalogue: {catalogue.length}</div> }));
vi.mock('@/components/common/SkeletonGrid', () => ({ default: () => <div role="status">Loading catalogue</div> }));
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));

afterEach(() => { cleanup(); vi.resetAllMocks(); });

it('shows the loading fallback', () => {
    query.mockReturnValue({ isLoading: true });
    render(<SelectionPageLoader />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading catalogue');
    expect(screen.queryByText(/Catalogue:/)).not.toBeInTheDocument();
});

it('passes a successful catalogue to the page', () => {
    query.mockReturnValue({ data: [], isLoading: false });
    render(<SelectionPageLoader />);
    expect(screen.getByText('Catalogue: 0')).toBeInTheDocument();
});

it('shows query errors and retries through refetch', () => {
    const refetch = vi.fn();
    query.mockReturnValue({ error: { status: 500 }, isLoading: false, refetch });
    render(<SelectionPageLoader />);
    expect(screen.getByText('generic')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'retry' }));
    expect(refetch).toHaveBeenCalledOnce();
});
