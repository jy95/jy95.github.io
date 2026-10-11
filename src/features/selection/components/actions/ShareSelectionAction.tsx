'use client';

import { useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import LoadingButton from '@/app/[locale]/games/_client/LoadingButton';
import { copyToClipboard } from '@/hooks/clipboard';
import { getPathname } from '@/i18n/routing';
import { encodeSelection } from '@/features/selection/sharing/sharing';
import type { NotificationApi } from '@/components/common/notifications/useNotification';
import type { SelectionDocument } from '@/domain/selection/types';

type ShareSelectionActionProps = {
  document: SelectionDocument;
  notifications: NotificationApi;
};

export function ShareSelectionAction({ document, notifications }: ShareSelectionActionProps) {
  const t = useTranslations('selection');
  const locale = useLocale();
  const [busy, setBusy] = useState(false);
  const [manualUrl, setManualUrl] = useState<string | null>(null);
  const pending = useRef(false);

  async function share() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setManualUrl(null);
    notifications.dismiss();
    try {
      const url = new URL(getPathname({ locale, href: '/selection' }), window.location.origin);
      url.search = new URLSearchParams({ entries: await encodeSelection(document) }).toString();
      if (await copyToClipboard(url.toString())) {
        notifications.success(t('copied'));
      } else {
        setManualUrl(url.toString());
        notifications.error(t('clipboardFailed'));
      }
    } catch {
      notifications.error(t('compressionUnavailable'));
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <>
      <LoadingButton loading={busy} onClick={share} label={t('share')} />
      {manualUrl && (
        <Box sx={{ width: '100%' }}>
          <Typography sx={{ mb: 1 }}>{t('copyFallback')}</Typography>
          <TextField
            label={t('shareLink')}
            value={manualUrl}
            fullWidth
            slotProps={{ input: { readOnly: true } }}
            onFocus={event => event.target.select()}
          />
        </Box>
      )}
    </>
  );
}
