import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('@/redux/services/planningAPI', () => ({
    useGetPlanningQuery: () => ({ data: [], isLoading: false, refetch: vi.fn() }),
}));
vi.mock('@/components/common/SuspenseBoundary', () => ({
    SuspenseBoundary: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@/components/common/GameDataGrid', () => ({
    GameDataGrid: (props: { showRelatedGames?: boolean }) => (
        <div data-testid="planning-grid">{String(props.showRelatedGames)}</div>
    ),
}));
vi.mock('@/components/planning/tableColumns', () => ({ default: () => [] }));

import PlanningViewer from './page';

describe('PlanningViewer', () => {
    it('enables related games for planning details', () => {
        render(<PlanningViewer />);
        expect(screen.getByTestId('planning-grid')).toHaveTextContent('true');
    });
});
