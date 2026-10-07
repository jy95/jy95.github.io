'use client';

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import { usePersonalSelection } from '@/features/selection/storage/hooks';

export default function PersonalSelectionBadge({ descriptionId }: { descriptionId?: string } = {}) {
  const { document } = usePersonalSelection();
  const t = useTranslations('dashboard.menuEntries');
  const count = document.games.length + document.backlog.length + document.dlcs.length + document.planning.length;

  return (
    <Box component="span" aria-label={t('selectionCount', { count })}
      sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 3, px: 0.6, minWidth: 18, fontSize: 11, textAlign: 'center' }}>
      {count}
      {descriptionId && <Box component="span" id={descriptionId}
        sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' }}>
        {t('selectionCount', { count })}
      </Box>}
    </Box>
  );
}
