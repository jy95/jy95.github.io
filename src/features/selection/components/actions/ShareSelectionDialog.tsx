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

export function ShareSelectionDialog({ url, onClose }: { url: string; onClose: () => void }) {
  const t = useTranslations('selection');
  const [copied, setCopied] = useState<boolean | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="share-selection-title">
      <DialogTitle id="share-selection-title">{t('share')}</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>{t('shareDescription')}</Typography>
        <TextField
          label={t('shareLink')}
          value={url}
          fullWidth
          slotProps={{ input: { readOnly: true } }}
          onFocus={event => event.target.select()}
        />
        {copied !== null && (
          <Alert sx={{ mt: 2 }} severity={copied ? 'success' : 'info'}>
            {t(copied ? 'copied' : 'copyFallback')}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('close')}</Button>
        <Button onClick={copy}>{t('copy')}</Button>
      </DialogActions>
    </Dialog>
  );
}

