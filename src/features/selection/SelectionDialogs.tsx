import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export function ClearSelectionDialog({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
    const t = useTranslations('selection');
    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="clear-selection-title">
            <DialogTitle id="clear-selection-title">{t('clear')}</DialogTitle>
            <DialogContent>{t('clearConfirm')}</DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('cancel')}</Button>
                <Button color="error" onClick={onConfirm}>{t('clear')}</Button>
            </DialogActions>
        </Dialog>
    );
}

export function ShareSelectionDialog({ shareUrl, onClose }: { shareUrl: string; onClose: () => void }) {
    const t = useTranslations('selection');
    const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
    async function copyLink() {
        try { await navigator.clipboard.writeText(shareUrl); setCopyState('copied'); }
        catch { setCopyState('failed'); }
    }
    return (
        <Dialog open={Boolean(shareUrl)} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="share-selection-title">
            <DialogTitle id="share-selection-title">{t('share')}</DialogTitle>
            <DialogContent>
                <Typography sx={{ mb: 2 }}>{t('shareDescription')}</Typography>
                <TextField label={t('shareLink')} value={shareUrl} fullWidth slotProps={{ input: { readOnly: true } }} onFocus={event => event.target.select()} />
                {copyState !== 'idle' && <Alert sx={{ mt: 2 }} severity={copyState === 'copied' ? 'success' : 'info'}>{t(copyState === 'copied' ? 'copied' : 'copyFallback')}</Alert>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('close')}</Button>
                <Button onClick={copyLink}>{t('copy')}</Button>
            </DialogActions>
        </Dialog>
    );
}
