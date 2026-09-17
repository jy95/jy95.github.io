import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

vi.mock('@/hooks/useMuiXDataGridText', () => ({ default: () => ({}) }));
vi.mock('@mui/x-data-grid', () => ({
    DataGrid: ({ rows, onRowClick }: { rows: { id: string; title: string }[]; onRowClick: (value: unknown) => void }) => (
        <button onClick={() => onRowClick({ row: rows[0] })}>select</button>
    ),
}));
vi.mock('@/features/games/detail/GameDetailView', () => ({
    default: ({ showRelatedGames }: { showRelatedGames?: boolean }) => (
        <div data-testid="detail-related">{String(showRelatedGames)}</div>
    ),
}));

import { GameDataGrid } from './GameDataGrid';

const props = {
    rows: [{
        id: 'game',
        title: 'Game',
        imagePath: '/covers/game.webp',
        url: 'https://example.com/game',
        url_type: 'VIDEO' as const,
    }],
    columns: [],
    loading: false,
    sortModel: [],
};

describe('GameDataGrid', () => {
    it('keeps related games disabled for callers that do not opt in', () => {
        render(<GameDataGrid {...props} />);
        fireEvent.click(screen.getByText('select'));
        expect(screen.getByTestId('detail-related')).toHaveTextContent('false');
    });

    it('forwards the related-games opt-in to the detail view', () => {
        render(<GameDataGrid {...props} showRelatedGames />);
        fireEvent.click(screen.getByText('select'));
        expect(screen.getByTestId('detail-related')).toHaveTextContent('true');
    });
});
