import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import SelectionPageLoader from './SelectionPageLoader';
import { emptySelection } from './documentTypes';
import { SELECTION_STORAGE_KEY } from './storageFormat';

const query = vi.hoisted(() => vi.fn());
const search = vi.hoisted(() => ({ value: '' }));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(search.value) }));
vi.mock('@/redux/services/selectionAPI', () => ({ useGetSelectionCatalogueQuery: query }));
vi.mock('./SelectionPage', () => ({ default: ({ catalogue }: { catalogue: unknown[] }) => <div>Catalogue: {catalogue.length}</div> }));
vi.mock('@/components/common/SkeletonGrid', () => ({ default: () => <div role="status">Loading catalogue</div> }));
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));

beforeEach(() => {
    search.value = '';
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify({ ...emptySelection(), games: ['a'] }));
});
afterEach(() => { cleanup(); localStorage.clear(); vi.resetAllMocks(); });

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
    expect(query).toHaveBeenLastCalledWith(undefined, { skip: false });
});

it('shows query errors and retries through refetch', () => {
    const refetch = vi.fn();
    query.mockReturnValue({ error: { status: 500 }, isLoading: false, refetch });
    render(<SelectionPageLoader />);
    expect(screen.getByText('generic')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'retry' }));
    expect(refetch).toHaveBeenCalledOnce();
});

it('does not request the catalogue when there is nothing to resolve', async () => {
    localStorage.clear();
    query.mockReturnValue({ data: undefined, isLoading: false });
    render(<SelectionPageLoader />);
    expect(await screen.findByText('Catalogue: 0')).toBeInTheDocument();
    expect(query).toHaveBeenLastCalledWith(undefined, { skip: true });
});

it('requests the catalogue for a shared link even with an empty selection', () => {
    localStorage.clear();
    search.value = 'entries=abc';
    query.mockReturnValue({ data: [], isLoading: false });
    render(<SelectionPageLoader />);
    expect(query).toHaveBeenLastCalledWith(undefined, { skip: false });
});