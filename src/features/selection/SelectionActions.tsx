'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import LoadingButton from '@/app/[locale]/games/_client/LoadingButton';
import { Link, getPathname } from '@/i18n/routing';
import { hasNewIds, isEmpty, type SelectionDocument } from './selectionDocument';
import { addSelection, clearSelection } from './selectionStore';
import { encodeSelection } from './sharing';

function ImportActions({ document, personal }: { document: SelectionDocument; personal: SelectionDocument }) {
    const t = useTranslations('selection');
    const canImport = hasNewIds(document, personal);
    return <>
        {!isEmpty(document) && (
            <Button variant="contained" disabled={!canImport} onClick={() => addSelection(document)}>
                {t(canImport ? 'import' : 'imported')}
            </Button>
        )}
        <Button component={Link} href="/selection">{t('openOwn')}</Button>
    </>;
}

function ClearAction() {
    const t = useTranslations('selection');
    const [open, setOpen] = useState(false);
    return <>
        <Button startIcon={<DeleteOutlinedIcon />} onClick={() => setOpen(true)}>{t('clear')}</Button>
        <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="clear-selection-title">
            <DialogTitle id="clear-selection-title">{t('clear')}</DialogTitle>
            <DialogContent>{t('clearConfirm')}</DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)}>{t('cancel')}</Button>
                <Button color="error" onClick={() => { clearSelection(); setOpen(false); }}>{t('clear')}</Button>
            </DialogActions>
        </Dialog>
    </>;
}

function ShareDialog({ url, onClose }: { url: string; onClose: () => void }) {
    const t = useTranslations('selection');
    const [copied, setCopied] = useState<boolean | null>(null);
    async function copy() {
        try { await navigator.clipboard.writeText(url); setCopied(true); }
        catch { setCopied(false); }
    }
    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="share-selection-title">
            <DialogTitle id="share-selection-title">{t('share')}</DialogTitle>
            <DialogContent>
                <Typography sx={{ mb: 2 }}>{t('shareDescription')}</Typography>
                <TextField label={t('shareLink')} value={url} fullWidth slotProps={{ input: { readOnly: true } }}
                    onFocus={event => event.target.select()} />
                {copied !== null && (
                    <Alert sx={{ mt: 2 }} severity={copied ? 'success' : 'info'}>{t(copied ? 'copied' : 'copyFallback')}</Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('close')}</Button>
                <Button onClick={copy}>{t('copy')}</Button>
            </DialogActions>
        </Dialog>
    );
}

type ShareState = { kind: 'idle' | 'busy' | 'error' } | { kind: 'ready'; url: string };

function ShareAction({ document }: { document: SelectionDocument }) {
    const t = useTranslations('selection');
    const locale = useLocale();
    const [state, setState] = useState<ShareState>({ kind: 'idle' });

    async function share() {
        setState({ kind: 'busy' });
        try {
            const url = new URL(getPathname({ locale, href: '/selection' }), window.location.origin);
            url.search = new URLSearchParams({ entries: await encodeSelection(document) }).toString();
            setState({ kind: 'ready', url: url.toString() });
        } catch {
            setState({ kind: 'error' });
        }
    }

    return <>
        <LoadingButton loading={state.kind === 'busy'} onClick={share} label={t('share')} />
        {state.kind === 'error' && <Alert severity="error">{t('compressionUnavailable')}</Alert>}
        {state.kind === 'ready' && <ShareDialog url={state.url} onClose={() => setState({ kind: 'idle' })} />}
    </>;
}

type Props = { shared: boolean; document: SelectionDocument; personal: SelectionDocument };

/** `document` is the full displayed selection, so sharing ignores display filters. */
export function SelectionActions({ shared, document, personal }: Props) {
    return (
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {shared
                ? <ImportActions document={document} personal={personal} />
                : !isEmpty(personal) && <ClearAction />}
            {!isEmpty(document) && <ShareAction document={document} />}
        </Stack>
    );
}