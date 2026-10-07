'use client';

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import { usePersonalSelection } from '@/features/selection/storage/hooks';

export default function PersonalSelectionBadge() {
  const { document } = usePersonalSelection();
  const t = useTranslations('dashboard.menuEntries');
  const count = document.games.length + document.backlog.length + document.dlcs.length + document.planning.length;

  return (
    <Box component="span" aria-label={t('selectionCount', { count })}
      sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 3, px: 0.6, minWidth: 18, fontSize: 11, textAlign: 'center' }}>
      {count}
    </Box>
  );
}
