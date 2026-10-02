import { useEffect, useState } from 'react';
import { parseSharedSelection, type SharedSelection } from './sharing';
import { transportError } from './sharingErrors';

export type SharedSelectionState = SharedSelection | { kind: 'processing' };

// Stable references so downstream memoization is not defeated by fresh literals.
const ABSENT: SharedSelectionState = { kind: 'absent' };
const PROCESSING: SharedSelectionState = { kind: 'processing' };

/** `query` should contain only the `selection` parameter, so filter changes never re-decode. */
export function useSharedSelection(query: string): SharedSelectionState {
    const [decoded, setDecoded] = useState<{ query: string; result: SharedSelection } | null>(null);
    useEffect(() => {
        let active = true;
        const publish = (result: SharedSelection) => {
            if (active) setDecoded({ query, result });
        };
        void parseSharedSelection(new URLSearchParams(query)).then(publish, error => publish({ kind: 'error', error: transportError(error) }));
        return () => { active = false; };
    }, [query]);
    if (!new URLSearchParams(query).has('selection')) return ABSENT;
    return decoded?.query === query ? decoded.result : PROCESSING;
}