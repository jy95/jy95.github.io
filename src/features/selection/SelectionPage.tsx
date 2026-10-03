'use client';

import { lazy, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { detailSections } from '@/domain/games/details';
import { useSelectionPage } from './useSelectionPage';
import { SelectionContent } from './SelectionContent';
import { ClearSelectionDialog } from './SelectionDialogs';
import type { SelectionEntry } from './catalogue';

// Rarely used and heavy (votes/Supabase, related games, share dialog): load on demand.
const GameDetailView = lazy(() => import('@/features/games/detail/GameDetailView'));
const ShareSelectionDialog = lazy(() => import('./ShareSelectionDialog'));

export default function SelectionPage({ catalogue }: { catalogue: SelectionEntry[] }) {
    const t = useTranslations('selection');
    const model = useSelectionPage(catalogue);
    const { status, dialogs } = model;
    const share = dialogs.share;
    return (
        <Stack spacing={2}>
            <Typography variant="h4" component="h1">{t(status.shared ? 'sharedTitle' : 'title')}</Typography>
            <Typography color="text.secondary">{t(status.shared ? 'sharedDescription' : 'description')}</Typography>
            {share.kind === 'error' && <Alert severity="error">{t(share.error)}</Alert>}
            {status.decodeError && <Alert severity="error">{t(status.decodeError)}</Alert>}
            {status.encoding && <Typography role="status">{t('processing')}</Typography>}
            <SelectionContent results={model.results} actions={model.actions} status={status} />
            <Suspense fallback={null}>
                {dialogs.detail && (
                    <GameDetailView
                        category={dialogs.detail.category}
                        game={dialogs.detail.game}
                        onClose={dialogs.closeDetail}
                        {...detailSections(dialogs.detail.source)}
                    />
                )}
                {share.kind === 'ready' && <ShareSelectionDialog key={share.url} shareUrl={share.url} onClose={dialogs.closeShare} />}
            </Suspense>
            <ClearSelectionDialog open={dialogs.clearOpen} onClose={dialogs.closeClear} onConfirm={dialogs.confirmClear} />
        </Stack>
    );
}