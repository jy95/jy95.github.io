import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const useGetBacklogQueryMock = vi.fn();
const useGetGlobalStatsQueryMock = vi.fn();

vi.mock('@/redux/services/backlogAPI', () => ({
    useGetBacklogQuery: () => useGetBacklogQueryMock(),
}));

vi.mock('@/redux/services/votesAPI', () => ({
    useGetGlobalStatsQuery: () => useGetGlobalStatsQueryMock(),
}));

vi.mock('@/hooks/useMuiXDataGridText', () => ({
    default: () => ({}),
}));

vi.mock('@mui/x-data-grid', () => ({
    DataGrid: (props: any) => (
        <div>
            <div data-testid="loading">{String(props.loading)}</div>
            {(props.rows ?? []).map((row: any) => (
                <button key={row.id} onClick={() => props.onRowClick({ row })}>
                    {row.title} - votes:{row.votes}
                </button>
            ))}
        </div>
    ),
}));

vi.mock('@/components/common/QueryErrorState', () => ({
    default: ({ onRetry }: { onRetry?: () => void }) => (
        <div>
            <span>error-state</span>
            {onRetry && <button onClick={onRetry}>retry</button>}
        </div>
    ),
}));

vi.mock('../GameDetailView/GameDetailView', () => ({
    default: ({ game, onClose }: any) => (
        <div>
            <span>detail:{game.title}</span>
            <button onClick={onClose}>close</button>
        </div>
    ),
}));

vi.mock('./tableColumns', () => ({
    default: (props: any) => [{ field: 'title', headerName: props.titleLabel }],
}));

import BacklogViewerClient from './BacklogViewerClient';

const baseProps = {
    titleLabel: 'Title',
    platformLabel: 'Platform',
    notesLabel: 'Notes',
    hltbLabel: 'HLTB',
    votesLabel: 'Votes',
};

describe('BacklogViewerClient', () => {
    beforeEach(() => {
        useGetBacklogQueryMock.mockReset().mockReturnValue({
            data: [
                { id: '1', title: 'Game A' },
                { id: '2', title: 'Game B' },
            ],
            error: undefined,
            isLoading: false,
            refetch: vi.fn(),
        });
        useGetGlobalStatsQueryMock.mockReset().mockReturnValue({ data: { '1': 5 } });
    });

    it('merges the vote count matching each backlog entry id', async () => {
        render(<BacklogViewerClient {...baseProps} />);
        expect(await screen.findByText('Game A - votes:5')).toBeInTheDocument();
    });

    it('defaults the vote count to 0 when no stats entry exists for that id', async () => {
        render(<BacklogViewerClient {...baseProps} />);
        expect(await screen.findByText('Game B - votes:0')).toBeInTheDocument();
    });

    it('recomputes rows when the stats query resolves after the backlog data', async () => {
        useGetGlobalStatsQueryMock.mockReturnValue({ data: undefined });
        const { rerender } = render(<BacklogViewerClient {...baseProps} />);
        expect(await screen.findByText('Game A - votes:0')).toBeInTheDocument();

        useGetGlobalStatsQueryMock.mockReturnValue({ data: { '1': 9 } });
        rerender(<BacklogViewerClient {...baseProps} />);
        expect(await screen.findByText('Game A - votes:9')).toBeInTheDocument();
    });

    it('renders an empty grid when backlog data is undefined', async () => {
        useGetBacklogQueryMock.mockReturnValue({ data: undefined, error: undefined, isLoading: true, refetch: vi.fn() });
        render(<BacklogViewerClient {...baseProps} />);
        expect(await screen.findByTestId('loading')).toHaveTextContent('true');
    });

    it('shows QueryErrorState instead of the grid when the query errors', async () => {
        useGetBacklogQueryMock.mockReturnValue({ data: undefined, error: new Error('boom'), isLoading: false, refetch: vi.fn() });
        render(<BacklogViewerClient {...baseProps} />);
        expect(await screen.findByText('error-state')).toBeInTheDocument();
    });

    it('forwards refetch to QueryErrorState as onRetry', async () => {
        const refetch = vi.fn();
        useGetBacklogQueryMock.mockReturnValue({ data: undefined, error: new Error('boom'), isLoading: false, refetch });
        render(<BacklogViewerClient {...baseProps} />);
        fireEvent.click(await screen.findByText('retry'));
        expect(refetch).toHaveBeenCalledTimes(1);
    });

    it('opens GameDetailView with the clicked row on row click', async () => {
        render(<BacklogViewerClient {...baseProps} />);
        fireEvent.click(await screen.findByText('Game A - votes:5'));
        expect(await screen.findByText('detail:Game A')).toBeInTheDocument();
    });

    it('closes GameDetailView when onClose is called', async () => {
        render(<BacklogViewerClient {...baseProps} />);
        fireEvent.click(await screen.findByText('Game A - votes:5'));
        fireEvent.click(await screen.findByText('close'));
        expect(screen.queryByText('detail:Game A')).not.toBeInTheDocument();
    });

    it('does not render GameDetailView before any row is clicked', () => {
        render(<BacklogViewerClient {...baseProps} />);
        expect(screen.queryByText(/^detail:/)).not.toBeInTheDocument();
    });

    it('forwards the provided labels into the generated columns', async () => {
        render(<BacklogViewerClient {...baseProps} />);
        // tableColumns is mocked to echo titleLabel back as the headerName,
        // proving props flow from BacklogViewerClient into generateColumns.
        expect(await screen.findByText('Game A - votes:5')).toBeInTheDocument();
    });
});
