'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { resolveSelection } from '@/domain/selection/resolution';
import { ClearSelectionAction } from './actions/ClearSelectionAction';
import { SelectionActions } from './actions/SelectionActions';
import { SelectionGrid } from './grid/SelectionGrid';
import { useSelectionDocument } from './useSelectionDocument';
import { SelectionNotices } from './SelectionNotices';
import { SelectionDetails } from './SelectionDetails';

import type { SelectionDocument, SelectionEntry } from '@/domain/selection/types';

function Header({ shared }: { shared: boolean }) {
    const t = useTranslations('selection');

    return (
        <>
            <Typography variant="h4" component="h1">
                {t(shared ? 'sharedTitle' : 'title')}
            </Typography>
            <Typography color="text.secondary">
                {t(shared ? 'sharedDescription' : 'description')}
            </Typography>
        </>
    );
}

type SelectionContentProps = {
    catalogue: SelectionEntry[];
    document: SelectionDocument;
    personal: SelectionDocument;
    shared: boolean;
    storageAvailable: boolean;
    invalid: boolean;
};

function SelectionContent({
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

            {invalid && !shared && <ClearSelectionAction />}
            <SelectionActions
                shared={shared}
                document={resolved.document}
                personal={personal}
            />

            <SelectionGrid
                entries={resolved.entries}
                shared={shared}
                onDetail={setDetail}
            />

            <SelectionDetails detail={detail} shared={shared} onClose={() => setDetail(null)} />
        </>
    );
}

export default function SelectionPage({ catalogue }: { catalogue: SelectionEntry[] }) {
    const common = useTranslations('common');
    const { personal, mode } = useSelectionDocument();

    if (mode.status === 'loading') {
        return <CircularProgress aria-label={common('loading')} />;
    }

    const shared = mode.shared;

    return (
        <Stack spacing={2}>
            <Header shared={shared} />
            {mode.status === 'error' ? (
                <SelectionNotices
                    storageAvailable={personal.storageAvailable}
                    invalid
                    count={0}
                    missing={[]}
                    shared
                />
            ) : (
                <SelectionContent
                    catalogue={catalogue}
                    document={mode.document}
                    personal={personal.document}
                    shared={shared}
                    storageAvailable={personal.storageAvailable}
                    invalid={!shared && personal.invalid}
                />
            )}
        </Stack>
    );
}
