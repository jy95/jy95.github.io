'use client';

import { useTranslations } from 'next-intl';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import GameDetailView from '@/features/games/detail/GameDetailView';
import { useSelectionPage } from './useSelectionPage';
import { SelectionContent } from './SelectionContent';
import { ClearSelectionDialog, ShareSelectionDialog } from './SelectionDialogs';
import type { SelectionEntry } from './catalogue';

export default function SelectionPage({ catalogue }: { catalogue: SelectionEntry[] }) {
    const t = useTranslations('selection');
    const model = useSelectionPage(catalogue);
    const share = model.sharing.state;
    return (
        <Stack spacing={2}>
            <Typography variant="h4" component="h1">{t(model.shared ? 'sharedTitle' : 'title')}</Typography>
            <Typography color="text.secondary">{t(model.shared ? 'sharedDescription' : 'description')}</Typography>
            {share.kind === 'error' && <Alert severity="error">{t(share.error)}</Alert>}
            {model.decoded.kind === 'error' && <Alert severity="error">{t(model.decoded.error)}</Alert>}
            {share.kind === 'processing' && <Typography role="status">{t('processing')}</Typography>}
            <SelectionContent model={model} />
            {model.detail && <GameDetailView game={model.detail.game} onClose={model.closeDetail} showVoteSection={model.detail.source === 'backlog'} showRelatedGames={model.detail.source !== 'backlog'} />}
            <ClearSelectionDialog open={model.clearOpen} onClose={model.closeClear} onConfirm={model.confirmClear} />
            {share.kind === 'ready' && <ShareSelectionDialog key={share.url} shareUrl={share.url} onClose={model.sharing.close} />}
        </Stack>
    );
}
