'use client';

import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import type { Notification } from './useNotification';

type NotificationSnackbarProps = {
  notification: Notification | null;
  onDismiss: () => void;
  dismissLabel: string;
};

export function NotificationSnackbar({ notification, onDismiss, dismissLabel }: NotificationSnackbarProps) {
  if (!notification) return null;
  return (
    <Snackbar
      key={notification.id}
      open
      onClose={(_, reason) => { if (reason !== 'clickaway') onDismiss(); }}
    >
      <Alert
        severity={notification.severity}
        role={notification.severity === 'error' ? 'alert' : 'status'}
        action={<>
          {notification.action}
          <IconButton aria-label={dismissLabel} color="inherit" size="small" onClick={onDismiss}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </>}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
}
