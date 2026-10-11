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

    const selectionUrl = new URL(getPathname({ locale, href: '/selection' }), window.location.origin);
    selectionUrl.search = new URLSearchParams({ entries: await encodeSelection(document) }).toString();
    const url = selectionUrl.toString();

    // Set up result in clipboard
    await navigator.clipboard?.writeText(url);

    // Use device sharing feature
    await navigator?.share({ title: t('title'), url });
  }

  return <Button onClick={share}>{t('share')}</Button>;
}
