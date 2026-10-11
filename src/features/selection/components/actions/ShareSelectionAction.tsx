'use client';

// Hooks
import { useLocale, useTranslations } from 'next-intl';

// MUI
import Button from '@mui/material/Button';

// Custom
import { getPathname } from '@/i18n/routing';
import { encodeSelection } from "@/features/selection/sharing/sharing";

// Type
import type { SelectionDocument } from '@/domain/selection/types';

type ShareSelectionActionProps = {
  document: SelectionDocument;
};

export function ShareSelectionAction({ document }: ShareSelectionActionProps) {
  const t = useTranslations('selection');
  const locale = useLocale();

  async function share() {
    let url: string;
    try {
      const selectionUrl = new URL(getPathname({ locale, href: '/selection' }), window.location.origin);
      selectionUrl.search = new URLSearchParams({ entries: await encodeSelection(document) }).toString();
      url = selectionUrl.toString();
    } catch {
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Unavailable or denied clipboard access must not prevent native sharing.
    }

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: t('title'), url });
      } catch {
        // Ignore native share failures and cancellation.
      }
    }
  }

  return <Button onClick={share}>{t('share')}</Button>;
}
