'use client';

import { lazy, Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { emptySelection } from '@/domain/selection/operations';
import { detailSections } from '@/domain/games/details';
import { resolveSelection } from '@/domain/selection/resolution';
import { usePersonalSelection } from '@/features/selection/storage/hooks';
import { useSharedSelection } from '@/features/selection/sharing/useSharedSelection';
import { SelectionActions } from './actions/SelectionActions';
import { SelectionGrid } from './grid/SelectionGrid';
import { MissingEntriesNotice } from './MissingEntriesNotice';

import type { SelectionDocument, SelectionEntry, SelectionIdentifier } from '@/domain/selection/types';

const GameDetailView = lazy(() => import('@/features/games/detail/GameDetailView'));

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

type NoticesProps = {
    storageAvailable: boolean;
    invalid: boolean;
    count: number;
    missing: SelectionIdentifier[];
    shared: boolean;
};

function Notices({ storageAvailable, invalid, count, missing, shared }: NoticesProps) {
    const t = useTranslations('selection');

    return (
        <>
            {!storageAvailable && <Alert severity="warning">{t('storageUnavailable')}</Alert>}
            {invalid && <Alert severity="error">{t('invalid')}</Alert>}
            <Typography role="status" aria-live="polite">
                {t('count', { count })}
            </Typography>
            <MissingEntriesNotice missing={missing} shared={shared} />
        </>
    );
}

type SelectionContentProps = {
    catalogue: SelectionEntry[];
    document: SelectionDocument;
    personal: SelectionDocument;
    shared: boolean;
    storageAvailable: boolean;
};

function SelectionContent({
    catalogue,
    document,
    personal,
    shared,
    storageAvailable,
}: SelectionContentProps) {
    const [detail, setDetail] = useState<SelectionEntry | null>(null);

    const resolved = useMemo(
        () => resolveSelection(catalogue, document),
        [catalogue, document]
    );

    return (
        <>
            <Notices
                storageAvailable={storageAvailable}
                invalid={false}
                count={resolved.entries.length}
                missing={resolved.missing}
                shared={shared}
            />

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

            {detail && (
                <Suspense fallback={null}>
                    <GameDetailView
                        category={detail.category}
                        game={detail.game}
                        onClose={() => setDetail(null)}
                        selectable={!shared}
                        {...detailSections(detail.source)}
                    />
                </Suspense>
            )}
        </>
    );
}

export default function SelectionPage({ catalogue }: { catalogue: SelectionEntry[] }) {
    const common = useTranslations('common');
    const searchParams = useSearchParams();
    const sharedState = useSharedSelection(searchParams.get('entries'));
    const personal = usePersonalSelection();

    if (!personal.hydrated || sharedState.status === 'loading') {
        return <CircularProgress aria-label={common('loading')} />;
    }

    const shared = sharedState.status !== 'none';
    const document = sharedState.status === 'ready'
        ? sharedState.document
        : shared
            ? emptySelection()
            : personal.document;

    return (
        <Stack spacing={2}>
            <Header shared={shared} />
            {sharedState.status === 'error' ? (
                <Notices
                    storageAvailable={personal.storageAvailable}
                    invalid
                    count={0}
                    missing={[]}
                    shared
                />
            ) : (
                <SelectionContent
                    catalogue={catalogue}
                    document={document}
                    personal={personal.document}
                    shared={shared}
                    storageAvailable={personal.storageAvailable}
                />
            )}
        </Stack>
    );
}
