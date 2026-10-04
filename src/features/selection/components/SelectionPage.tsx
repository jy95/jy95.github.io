'use client';

import { useTranslations } from 'next-intl';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { SelectionHeader } from './page/SelectionHeader';
import { SelectionContent } from './page/SelectionContent';
import { SelectionNotices } from './page/SelectionNotices';
import { useSelectionDocument } from './page/useSelectionDocument';
import type { SelectionEntry } from '@/domain/selection/types';

export default function SelectionPage({ catalogue }: { catalogue: SelectionEntry[] }) {
    const common = useTranslations('common');
    const selection = useSelectionDocument();

    if (selection.status === 'loading') {
        return <CircularProgress aria-label={common('loading')} />;
    }

    return (
        <Stack spacing={2}>
            <SelectionHeader shared={selection.status === 'error' || selection.shared} />
            {selection.status === 'error' ? (
                <SelectionNotices
                    storageAvailable={selection.storageAvailable}
                    invalid
                    count={0}
                    missing={[]}
                    shared
                />
            ) : (
                <SelectionContent
                    catalogue={catalogue}
                    document={selection.document}
                    personal={selection.personal}
                    shared={selection.shared}
                    storageAvailable={selection.storageAvailable}
                    invalid={selection.invalid}
                />
            )}
        </Stack>
    );
}
