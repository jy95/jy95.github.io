'use client';

import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { detailSections } from '@/domain/games/details';
import { documentOf, resolveSelection, type SelectionDocument } from './selectionDocument';
import { usePersonalSelection } from './selectionStore';
import { decodeSelection } from './sharing';
import { SelectionActions } from './SelectionActions';
import { SelectionGrid } from './SelectionGrid';
import type { SelectionEntry } from './catalogue';

// Heavy (votes/Supabase, related games): load on demand.
const GameDetailView = lazy(() => import('@/features/games/detail/GameDetailView'));

type Shared =
    | { status: 'none' | 'loading' | 'error' }
    | { status: 'ready'; document: SelectionDocument };
const NONE: Shared = { status: 'none' };
const LOADING: Shared = { status: 'loading' };
const ERROR: Shared = { status: 'error' };

/** Decodes `?entries=`. A shared selection never touches personal storage. */
function useSharedSelection(param: string | null): Shared {
    const [result, setResult] = useState<{ param: string; state: Shared } | null>(null);
    useEffect(() => {
        if (param === null) return;
        let active = true;
        void decodeSelection(param).then(document => {
            if (active) setResult({ param, state: document ? { status: 'ready', document } : ERROR });
        });
        return () => { active = false; };
    }, [param]);
    if (param === null) return NONE;
    return result?.param === param ? result.state : LOADING;
}

function shownDocument(shared: Shared, own: SelectionDocument): SelectionDocument | null {
    if (shared.status === 'ready') return shared.document;
    return shared.status === 'none' ? own : null;
}

function Header({ shared }: { shared: boolean }) {
    const t = useTranslations('selection');
    return <>
        <Typography variant="h4" component="h1">{t(shared ? 'sharedTitle' : 'title')}</Typography>
        <Typography color="text.secondary">{t(shared ? 'sharedDescription' : 'description')}</Typography>
    </>;
}

type NoticesProps = { storageAvailable: boolean; invalid: boolean; count: number; missing: number };

function Notices({ storageAvailable, invalid, count, missing }: NoticesProps) {
    const t = useTranslations('selection');
    return <>
        {!storageAvailable && <Alert severity="warning">{t('storageUnavailable')}</Alert>}
        {invalid && <Alert severity="error">{t('invalid')}</Alert>}
        <Typography role="status" aria-live="polite">{t('count', { count })}</Typography>
        {missing > 0 && <Alert severity="info">{t('unavailable', { count: missing })}</Alert>}
    </>;
}

export default function SelectionPage({ catalogue }: { catalogue: SelectionEntry[] }) {
    const common = useTranslations('common');
    const shared = useSharedSelection(useSearchParams().get('entries'));
    const personal = usePersonalSelection();
    const [detail, setDetail] = useState<SelectionEntry | null>(null);
    const shown = shownDocument(shared, personal.document);
    const { entries, missing } = useMemo(() => resolveSelection(catalogue, shown), [catalogue, shown]);
    const document = useMemo(() => documentOf(entries), [entries]);

    if (!personal.hydrated || shared.status === 'loading') {
        return <CircularProgress aria-label={common('loading')} />;
    }
    const isShared = shared.status !== 'none';
    return (
        <Stack spacing={2}>
            <Header shared={isShared} />
            <Notices storageAvailable={personal.storageAvailable} invalid={shared.status === 'error'}
                count={entries.length} missing={missing} />
            <SelectionActions shared={isShared} document={document} personal={personal.document} />
            {shared.status !== 'error' && <SelectionGrid entries={entries} shared={isShared} onDetail={setDetail} />}
            {detail && (
                <Suspense fallback={null}>
                    <GameDetailView category={detail.category} game={detail.game}
                        onClose={() => setDetail(null)} {...detailSections(detail.source)} />
                </Suspense>
            )}
        </Stack>
    );
}