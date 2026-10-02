'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ShareIcon from '@mui/icons-material/Share';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { getPathname, Link } from '@/i18n/routing';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useGamesFilters } from '@/features/games/useGamesFilters';
import GamesFilters from '@/app/[locale]/games/_client/GamesFilters';
import CardEntry from '@/features/games/components/CardEntry';
import BaseCard from '@/features/games/components/BaseCard';
import GameCardOverlay from '@/features/games/components/GameCardOverlay';
import GameDetailView from '@/features/games/detail/GameDetailView';
import { browseGames } from '@/lib/browseGames';
import SelectionButton from './SelectionButton';
import { addSelection, clearSelection } from './selectionSlice';
import { parseSharedSelection, selectionQuery } from './sharing';
import type { SelectionEntry } from './catalogue';

export default function SelectionPage({ catalogue }: { catalogue: SelectionEntry[] }) {
    const t = useTranslations('selection');
    const common = useTranslations('common');
    const locale = useLocale();
    const params = useSearchParams();
    const sharedIds = parseSharedSelection(new URLSearchParams(params.toString()));
    const shared = sharedIds !== null;
    const { ids, hydrated, storageAvailable } = useAppSelector(state => state.selection);
    const dispatch = useAppDispatch();
    const { filters, updateFilters } = useGamesFilters();
    const [clearOpen, setClearOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
    const [detail, setDetail] = useState<SelectionEntry | null>(null);
    const requested = sharedIds ?? ids;
    const byId = new Map(catalogue.map(entry => [entry.selectionId, entry]));
    const entries = requested.flatMap(id => { const entry = byId.get(id); return entry ? [entry] : []; });
    const unavailable = requested.length - entries.length;
    const selectedIds = entries.map(entry => entry.selectionId);
    const canImport = selectedIds.some(id => !ids.includes(id));
    const visible = browseGames(entries.map(entry => ({ ...entry.game, entry })), filters);

    function shareSelection() {
        const path = getPathname({ locale, href: '/selection' });
        const url = new URL(path, window.location.origin);
        url.search = selectionQuery(selectedIds);
        setCopyState('idle');
        setShareUrl(url.toString());
    }

    return (
        <Stack spacing={2}>
            <Typography variant="h4" component="h1">{t(shared ? 'sharedTitle' : 'title')}</Typography>
            <Typography color="text.secondary">{t(shared ? 'sharedDescription' : 'description')}</Typography>
            {!hydrated ? <CircularProgress aria-label={common('loading')} /> : <>
                {!storageAvailable && <Alert severity="warning">{t('storageUnavailable')}</Alert>}
                <Typography role="status">{t('count', { count: entries.length })}</Typography>
                {unavailable > 0 && <Alert severity="info">{t('unavailable', { count: unavailable })}</Alert>}
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                    {shared ? <>
                        {entries.length > 0 && <Button variant="contained" disabled={!canImport} onClick={() => dispatch(addSelection(selectedIds))}>{t(canImport ? 'import' : 'imported')}</Button>}
                        <Button component={Link} href="/selection">{t('openOwn')}</Button>
                    </> : ids.length > 0 && <Button startIcon={<DeleteOutlinedIcon />} onClick={() => setClearOpen(true)}>{t('clear')}</Button>}
                    {entries.length > 0 && <Button startIcon={<ShareIcon />} onClick={shareSelection}>{t('share')}</Button>}
                </Stack>
                {entries.length === 0 ? (
                    <Box sx={{ py: 5, textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>{t(shared ? 'sharedEmpty' : 'empty')}</Typography>
                        <Button component={Link} href="/games" variant="outlined">{t('browse')}</Button>
                    </Box>
                ) : <>
                    <GamesFilters filters={filters} onChange={updateFilters} />
                    {visible.length === 0 && <Typography role="status">{common('noResults')}</Typography>}
                    <Grid container spacing={1} rowSpacing={1}>
                        {visible.map(({ entry }) => (
                            <Grid key={entry.selectionId} size={{ xs: 6, md: 4, lg: 2 }}>
                                {entry.source === 'published' ? <CardEntry game={entry.game} /> : (
                                    <BaseCard
                                        item={entry.game}
                                        onClick={() => setDetail(entry)}
                                        overlayPersistent
                                        overlaySlot={game => <GameCardOverlay game={game} />}
                                        actionsSlot={game => <SelectionButton id={entry.selectionId} title={game.title} />}
                                    />
                                )}
                            </Grid>
                        ))}
                    </Grid>
                </>}
            </>}
            {detail && <GameDetailView game={detail.game} onClose={() => setDetail(null)} showVoteSection={detail.source === 'backlog'} showRelatedGames={detail.source !== 'backlog'} />}
            <Dialog open={clearOpen} onClose={() => setClearOpen(false)} aria-labelledby="clear-selection-title">
                <DialogTitle id="clear-selection-title">{t('clear')}</DialogTitle>
                <DialogContent>{t('clearConfirm')}</DialogContent>
                <DialogActions>
                    <Button onClick={() => setClearOpen(false)}>{t('cancel')}</Button>
                    <Button color="error" onClick={() => { dispatch(clearSelection()); setClearOpen(false); }}>{t('clear')}</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={Boolean(shareUrl)} onClose={() => setShareUrl('')} fullWidth maxWidth="sm" aria-labelledby="share-selection-title">
                <DialogTitle id="share-selection-title">{t('share')}</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>{t('shareDescription')}</Typography>
                    <TextField label={t('shareLink')} value={shareUrl} fullWidth slotProps={{ input: { readOnly: true } }} onFocus={event => event.target.select()} />
                    {copyState !== 'idle' && <Alert sx={{ mt: 2 }} severity={copyState === 'copied' ? 'success' : 'info'}>{t(copyState === 'copied' ? 'copied' : 'copyFallback')}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShareUrl('')}>{t('close')}</Button>
                    <Button onClick={async () => {
                        try { await navigator.clipboard.writeText(shareUrl); setCopyState('copied'); }
                        catch { setCopyState('failed'); }
                    }}>{t('copy')}</Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}
