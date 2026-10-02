import { useTranslations } from 'next-intl';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

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