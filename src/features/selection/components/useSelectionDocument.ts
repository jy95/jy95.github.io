import { useSearchParams } from 'next/navigation';
import { usePersonalSelection } from '../storage/hooks';
import { useSharedSelection } from '../sharing/useSharedSelection';
import type { SelectionDocument } from '@/domain/selection/types';

type DocumentMode =
    | { status: 'loading' }
    | { status: 'error'; shared: true }
    | { status: 'ready'; shared: boolean; document: SelectionDocument };

/** Chooses the displayed document; decoding and persistence stay in their own boundaries. */
export function useSelectionDocument() {
    const searchParams = useSearchParams();
    const shared = useSharedSelection(searchParams.get('entries'));
    const personal = usePersonalSelection();
    let mode: DocumentMode;

    if (!personal.hydrated || shared.status === 'loading') {
        mode = { status: 'loading' };
    } else if (shared.status === 'error') {
        mode = { status: 'error', shared: true };
    } else if (shared.status === 'ready') {
        mode = { status: 'ready', shared: true, document: shared.document };
    } else {
        mode = { status: 'ready', shared: false, document: personal.document };
    }

    return { personal, mode };
}
