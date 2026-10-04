'use client';

// Hooks
import { useState } from 'react';
import { useTranslations } from 'next-intl';

// MUI
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
  const [open, setOpen] = useState(false);

  const handleClear = () => {
    clearSelection();
    setOpen(false);
  };

  return (
    <>
      <Button startIcon={<DeleteOutlinedIcon />} onClick={() => setOpen(true)}>
        {t('clear')}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="clear-selection-title">
        <DialogTitle id="clear-selection-title">{t('clear')}</DialogTitle>
        <DialogContent>{t('clearConfirm')}</DialogContent>
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