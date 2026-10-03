import { useEffect, useState } from 'react';
import { parseSharedSelection, type SharedSelection } from './sharing';
import type { SelectionSearchParams } from './sharingQuery';
import { transportError } from './sharingErrors';

export type SharedSelectionState = SharedSelection | { kind: 'processing' };

// Stable references so downstream memoization is not defeated by fresh literals.
const ABSENT: SharedSelectionState = { kind: 'absent' };
const PROCESSING: SharedSelectionState = { kind: 'processing' };

/** Key decoding only to entries values, including duplicates and empty values. */
export function useSharedSelection(params: SelectionSearchParams): SharedSelectionState {
    const key = JSON.stringify(params.getAll('entries'));
    const [decoded, setDecoded] = useState<{ key: string; result: SharedSelection } | null>(null);

    useEffect(() => {
        const values: string[] = JSON.parse(key);
        if (values.length === 0) return;
        let active = true;
        const publish = (result: SharedSelection) => {
            if (active) setDecoded({ key, result });
        };
        void parseSharedSelection({ getAll: name => name === 'entries' ? values : [] }).then(publish, error =>
            publish({ kind: 'error', error: transportError(error) }),
        );
        return () => { active = false; };
    }, [key]);

    if (key === '[]') return ABSENT;
    return decoded?.key === key ? decoded.result : PROCESSING;
}
