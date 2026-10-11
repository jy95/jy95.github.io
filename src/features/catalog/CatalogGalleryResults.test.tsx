import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { echoTranslations } from '@/test/mocks/nextIntl';
import CatalogGalleryResults from './CatalogGalleryResults';

vi.mock('next-intl', () => echoTranslations());
const items = [{ id: 'parent', name: 'Batman' }, { id: 2, name: 'Zelda' }];
const pages = items.map(item => ({ items: [item], total_items: 2 }));
const props = {
    onRetry: vi.fn(), onLoadMore: vi.fn(), emptyLabel: 'Empty', loadMoreLabel: 'More',
    renderCard: (item: typeof items[number]) => <input aria-label={item.name} defaultValue={item.name} />,
};

describe('CatalogGalleryResults', () => {
    it('flattens pages and preserves card identity for string and numeric IDs', () => {
        const view = render(<CatalogGalleryResults {...props} currentData={{ pages }} hasNextPage />);
        const batman = screen.getByLabelText('Batman');
        const zelda = screen.getByLabelText('Zelda');
        view.rerender(<CatalogGalleryResults {...props} currentData={{ pages: [...pages].reverse() }} hasNextPage />);
        expect(screen.getByLabelText('Batman')).toBe(batman);
        expect(screen.getByLabelText('Zelda')).toBe(zelda);
        fireEvent.click(screen.getByRole('button', { name: 'More' }));
        expect(props.onLoadMore).toHaveBeenCalledOnce();
    });
    it('renders loading and empty states, and disables unavailable pagination', () => {
        const view = render(<CatalogGalleryResults {...props} isFetching />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        view.rerender(<CatalogGalleryResults {...props} currentData={{ pages: [{ items: [], total_items: 0 }] }} />);
        expect(screen.getByText('Empty')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'More' })).toBeDisabled();
    });
    it('shows only retry without current data and retains cards for pagination errors', () => {
        const retry = vi.fn();
        const view = render(<CatalogGalleryResults {...props} onRetry={retry} isError isFetching />);
        expect(screen.queryByText('More')).not.toBeInTheDocument();
        expect(screen.queryByText('Empty')).not.toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'common.errors.retry' }));
        expect(retry).toHaveBeenCalledOnce();
        view.rerender(<CatalogGalleryResults {...props} onRetry={retry} isError currentData={{ pages }} hasNextPage />);
        expect(screen.getByLabelText('Batman')).toBeInTheDocument();
        expect(screen.getByLabelText('Zelda')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'More' })).toBeEnabled();
        expect(screen.getByRole('button', { name: 'common.errors.retry' })).toBeEnabled();
    });
});
