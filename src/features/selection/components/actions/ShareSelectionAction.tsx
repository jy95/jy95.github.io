'use client';

// Hooks
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

// MUI
import Alert from '@mui/material/Alert';
import { ShareSelectionDialog } from './ShareSelectionDialog';

// Custom
import LoadingButton from '@/app/[locale]/games/_client/LoadingButton';
import { getPathname } from '@/i18n/routing';
import { encodeSelection } from "@/features/selection/sharing/sharing";

import type { SelectionDocument } from '@/domain/selection/types';

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
        <ShareSelectionDialog url={state.url} onClose={() => setState({ kind: 'idle' })} />
      )}
    </>
  );
}