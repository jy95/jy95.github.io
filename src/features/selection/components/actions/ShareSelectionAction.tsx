'use client';

// Hooks
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

// MUI
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

// Custom
import LoadingButton from '@/app/[locale]/games/_client/LoadingButton';
import { getPathname } from '@/i18n/routing';
import { encodeSelection } from "@/features/selection/sharing/sharing";

// Type
import type { SelectionDocument } from '@/domain/selection/types';

type ShareState = 'idle' | 'busy' | 'error';

type ShareSelectionActionProps = {
  document: SelectionDocument;
};

export function ShareSelectionAction({ document }: ShareSelectionActionProps) {
  const t = useTranslations('selection');
  const locale = useLocale();
  const [state, setState] = useState<ShareState>('idle');

  const [copied, setCopied] = useState(false);

  async function share() {
    setState('busy');
    let url: string;
    try {
      const selectionUrl = new URL(getPathname({ locale, href: '/selection' }), window.location.origin);
      selectionUrl.search = new URLSearchParams({ entries: await encodeSelection(document) }).toString();
      url = selectionUrl.toString();
    } catch {
      setState('error');
      return;
    }
    setState('idle');

    try {
      if (!navigator.canShare) {
        await navigator.share({ title: t('title'), url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
      }
    } catch {
      setState('error');
    }
  }

  return (
    <>
      <LoadingButton loading={state === 'busy'} onClick={share} label={t('share')} />
      {state === 'error' && <Alert severity="error">{t('compressionUnavailable')}</Alert>}
      <Snackbar open={copied} autoHideDuration={500} onClose={() => setCopied(false)} message={t('copied')} />
    </>
  );
}
