import { lazy, Suspense } from 'react';
import { detailSections } from '@/domain/games/details';
import type { SelectionEntry } from '@/domain/selection/types';

const GameDetailView = lazy(() => import('@/features/games/detail/GameDetailView'));

type SelectionDetailProps = {
    detail: SelectionEntry | null;
    shared: boolean;
    onClose: () => void;
};

export function SelectionDetail({ detail, shared, onClose }: SelectionDetailProps) {
    if (!detail) return null;

    return (
        <Suspense fallback={null}>
            <GameDetailView
                category={detail.category}
                game={detail.game}
                onClose={onClose}
                selectable={!shared}
                {...detailSections(detail.source)}
            />
        </Suspense>
    );
}
