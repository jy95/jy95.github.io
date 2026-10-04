'use client';

// Hooks
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

// MUI
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// Custom
import LoadingButton from '@/app/[locale]/games/_client/LoadingButton';
import { getPathname } from '@/i18n/routing';
import { encodeSelection } from "@/features/selection/sharing/sharing";

import type { SelectionDocument } from '@/domain/selection/types';

function ShareDialog({ url, onClose }: { url: string; onClose: () => void }) {
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

type ShareState = { kind: 'idle' | 'busy' | 'error' } | { kind: 'ready'; url: string };

type ShareSelectionActionProps = {
  document: SelectionDocument;
};

export function ShareSelectionAction({ document }: ShareSelectionActionProps) {
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

  return (
    <>
      <LoadingButton loading={state.kind === 'busy'} onClick={share} label={t('share')} />
      {state.kind === 'error' && <Alert severity="error">{t('compressionUnavailable')}</Alert>}
      {state.kind === 'ready' && (
        <ShareDialog url={state.url} onClose={() => setState({ kind: 'idle' })} />
      )}
    </>
  );
}