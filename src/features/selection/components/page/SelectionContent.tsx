import { useEffect, useMemo, useState } from 'react';
import { resolveSelection } from '@/domain/selection/resolution';
import { removeSelections } from '@/features/selection/storage/store';
import { SelectionActions } from '../actions/SelectionActions';
import { SelectionGrid } from '../grid/SelectionGrid';
import { SelectionNotices } from './SelectionNotices';
import { SelectionDetail } from './SelectionDetail';
import type { SelectionDocument, SelectionEntry } from '@/domain/selection/types';

type SelectionContentProps = {
    catalogue: SelectionEntry[];
    document: SelectionDocument;
    personal: SelectionDocument;
    shared: boolean;
    storageAvailable: boolean;
    invalid: boolean;
};

export function SelectionContent({
    catalogue,
    document,
    personal,
    shared,
    storageAvailable,
    invalid,
}: SelectionContentProps) {
    const [detail, setDetail] = useState<SelectionEntry | null>(null);

    const resolved = useMemo(
        () => resolveSelection(catalogue, document),
        [catalogue, document]
    );

    const missing = resolved.missing;

    // This component mounts after hydration and successful catalogue loading.
    useEffect(() => {
        if (shared) return;
        removeSelections(missing);
    }, [missing, shared]);

    return (
        <>
            <SelectionNotices
                storageAvailable={storageAvailable}
                invalid={invalid}
                count={resolved.entries.length}
                shared={shared}
            />

            <SelectionActions
                invalid={invalid}
                shared={shared}
                document={document}
                personal={personal}
            />

            <SelectionGrid
                entries={resolved.entries}
                shared={shared}
                onDetail={setDetail}
            />

            <SelectionDetail
                detail={detail}
                shared={shared}
                onClose={() => setDetail(null)}
            />
        </>
    );
}

