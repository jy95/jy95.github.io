'use client';

import { useTranslations } from 'next-intl';
import Button from '@mui/material/Button';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

import { clearSelection } from '@/features/selection/storage/store';
import type { NotificationApi } from '@/components/common/notifications/useNotification';

export function ClearSelectionAction({ notifications }: { notifications: NotificationApi }) {
  const t = useTranslations('selection');
  const handleClear = () => {
    if (clearSelection()) notifications.success(t('cleared'));
    else notifications.error(t('storageUnavailable'));
  };

  return (
    <Button startIcon={<DeleteOutlinedIcon />} onClick={handleClear}>
      {t('clear')}
    </Button>
  );
}
