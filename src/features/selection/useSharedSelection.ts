import { useEffect, useState } from 'react';
import { parseSharedSelection, type SharedSelection } from './sharing';
import { transportError } from './sharingErrors';

export type SharedSelectionState = SharedSelection | { kind: 'processing' };

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
    if (!new URLSearchParams(query).has('selection')) return { kind: 'absent' };
    if (decoded?.query !== query) return { kind: 'processing' };
    return decoded.result;
}
