'use client';

import { useTranslations } from 'next-intl';
import Stack from '@mui/material/Stack';

import { NotificationSnackbar } from '@/components/common/notifications/NotificationSnackbar';
import { useNotification } from '@/components/common/notifications/useNotification';
import { isEmpty } from '@/domain/selection/operations';
import type { SelectionDocument } from '@/domain/selection/types';
import { ClearSelectionAction } from './ClearSelectionAction';
import { ImportSelectionAction } from './ImportSelectionAction';
import { ShareSelectionAction } from './ShareSelectionAction';

type SelectionActionsProps = {
  shared: boolean;
  invalid?: boolean;
  document: SelectionDocument;
  personal: SelectionDocument;
};

/** `document` is the full displayed selection, so sharing ignores display filters. */
export function SelectionActions({ shared, invalid = false, document, personal }: SelectionActionsProps) {
  const notifications = useNotification();
  const t = useTranslations('selection');
  return (
    <>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {shared && <ImportSelectionAction document={document} personal={personal} />}
        {!shared && (invalid || !isEmpty(personal)) && <ClearSelectionAction notifications={notifications} />}
        {!isEmpty(document) && <ShareSelectionAction document={document} notifications={notifications} />}
      </Stack>
      <NotificationSnackbar
        notification={notifications.notification}
        onDismiss={notifications.dismiss}
        dismissLabel={t('close')}
      />
    </>
  );
}
