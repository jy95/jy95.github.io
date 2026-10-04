import { useMemo, useState } from 'react';
import { resolveSelection } from '@/domain/selection/resolution';
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

    return (
        <>
            <SelectionNotices
                storageAvailable={storageAvailable}
                invalid={invalid}
                count={resolved.entries.length}
                missing={resolved.missing}
                shared={shared}
            />

            <SelectionActions
                invalid={invalid}
                shared={shared}
                document={resolved.document}
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

