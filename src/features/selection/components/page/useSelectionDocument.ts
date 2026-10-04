import { useSearchParams } from 'next/navigation';
import { usePersonalSelection } from '@/features/selection/storage/hooks';
import { useSharedSelection } from '@/features/selection/sharing/useSharedSelection';

/** Selects document authority before catalogue resolution or display filtering. */
export function useSelectionDocument() {
    const searchParams = useSearchParams();
    const sharedState = useSharedSelection(searchParams.get('entries'));
    const personal = usePersonalSelection();

    if (!personal.hydrated || sharedState.status === 'loading') {
        return { status: 'loading' } as const;
    }

    if (sharedState.status === 'error') {
        return { status: 'error', shared: true, storageAvailable: personal.storageAvailable } as const;
    }

    const shared = sharedState.status === 'ready';
    return {
        status: 'ready',
        document: shared ? sharedState.document : personal.document,
        personal: personal.document,
        shared,
        storageAvailable: personal.storageAvailable,
        invalid: !shared && personal.invalid,
    } as const;
}
