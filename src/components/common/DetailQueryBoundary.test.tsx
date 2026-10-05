import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { echoTranslations } from '@/test/mocks/nextIntl';
import { DetailQueryBoundary } from './DetailQueryBoundary';
import { useDetailRouteId } from '@/hooks/useDetailRouteId';

const { notFound } = vi.hoisted(() => ({ notFound: vi.fn(() => null) }));
vi.mock('next/navigation', () => ({ notFound }));
vi.mock('next-intl', () => echoTranslations());

describe('detail route handling', () => {
    it('unwraps the promised route ID', async () => {
        function Route({ params }: { params: Promise<{ id: string }> }) {
            return <div>{useDetailRouteId(params)}</div>;
        }
        await act(async () => { render(<Route params={Promise.resolve({ id: 'a/b' })} />); });
        expect(screen.getByText('a/b')).toBeInTheDocument();
    });
    it('preserves loading, missing data, and typed success rendering', () => {
        const child = vi.fn((data: { name: string }) => <div>{data.name}</div>);
        const view = render(<DetailQueryBoundary error={undefined} isLoading data={undefined}>{child}</DetailQueryBoundary>);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        view.rerender(<DetailQueryBoundary error={undefined} isLoading={false} data={undefined}>{child}</DetailQueryBoundary>);
        expect(view.container).toBeEmptyDOMElement();
        expect(child).not.toHaveBeenCalled();
        view.rerender(<DetailQueryBoundary error={undefined} isLoading={false} data={{ name: 'Series' }}>{child}</DetailQueryBoundary>);
        expect(screen.getByText('Series')).toBeInTheDocument();
    });
    it('routes numeric HTTP 404 to notFound', () => {
        notFound.mockClear();
        render(<DetailQueryBoundary error={{ status: 404 }} isLoading={false} data={undefined}>{() => null}</DetailQueryBoundary>);
        expect(notFound).toHaveBeenCalledOnce();
    });
    it.each([{ status: 500 }, { message: 'Serialized error' }, 'error', { status: '404' }])('keeps unknown and non-404 errors retryable: %j', error => {
        notFound.mockClear();
        const retry = vi.fn();
        render(<DetailQueryBoundary error={error} isLoading data={{ name: 'Hidden' }} onRetry={retry}>{data => <div>{data.name}</div>}</DetailQueryBoundary>);
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
        fireEvent.click(screen.getByText('common.errors.retry'));
        expect(retry).toHaveBeenCalledOnce();
        expect(notFound).not.toHaveBeenCalled();
    });
});
