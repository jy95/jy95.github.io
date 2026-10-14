import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

const query = vi.hoisted(() => vi.fn());
vi.mock('@/redux/services/statsAPI', () => ({ useGetStatsQuery: query }));
vi.mock('./_client/SkeletonStats', () => ({ default: () => <div>Loading statistics</div> }));
vi.mock('./_client/GeneralStats', () => ({ default: () => <div>General statistics</div> }));
vi.mock('./_client/GenresChart', () => ({ default: () => <div>Genres</div> }));
vi.mock('./_client/PlatformsChart', () => ({ default: () => <div>Platforms</div> }));
vi.mock('@/components/common/QueryErrorState', () => ({ default: ({ onRetry }: { onRetry: () => void }) => <button onClick={onRetry}>Retry</button> }));

import StatsPage from './PageClient';

beforeEach(() => query.mockReset());
it('shows a loading fallback while statistics are fetched', () => {
    query.mockReturnValue({ isLoading: true });
    render(<StatsPage />);
    expect(screen.getByText('Loading statistics')).toBeInTheDocument();
});
it('renders each statistics view after loading', () => {
    query.mockReturnValue({ isLoading: false, data: {} });
    render(<StatsPage />);
    for (const label of ['General statistics', 'Genres', 'Platforms']) expect(screen.getByText(label)).toBeInTheDocument();
});
it('retries a failed statistics request', () => {
    const refetch = vi.fn();
    query.mockReturnValue({ isLoading: false, error: { status: 500 }, refetch });
    render(<StatsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalledOnce();
});
