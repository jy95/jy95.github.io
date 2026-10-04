'use client';

// Hooks
import { useState } from 'react';
import { useTranslations } from 'next-intl';

// MUI
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

// Action
import { clearSelection } from "@/features/selection/storage/store";

export function ClearSelectionAction() {
  const t = useTranslations('selection');
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

  const handleClear = () => {
    const success = clearSelection();
    setFailed(!success);
    if (success) setOpen(false);
  };

  return (
    <>
      <Button startIcon={<DeleteOutlinedIcon />} onClick={() => {
        setFailed(false);
        setOpen(true);
      }}>
        {t('clear')}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="clear-selection-title">
        <DialogTitle id="clear-selection-title">{t('clear')}</DialogTitle>
        <DialogContent>{t('clearConfirm')}{failed && <Alert severity="error">{t('storageUnavailable')}</Alert>}</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('cancel')}</Button>
          <Button color="error" onClick={handleClear}>
            {t('clear')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}