'use client';

// Hooks
import { useState } from 'react';
import { useTranslations } from 'next-intl';

// MUI
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Others
import { toggleSelection } from '@/features/selection/storage/store';

// Types
import type { SelectionIdentifier } from '@/domain/selection/types';


type MissingEntriesNoticeProps = {
  missing: SelectionIdentifier[];
  shared: boolean;
};

export function MissingEntriesNotice({ missing, shared }: MissingEntriesNoticeProps) {
  const t = useTranslations('selection');
  const [expanded, setExpanded] = useState(false);

  if (missing.length === 0) return null;

  return (
    <Alert
      severity="warning"
      action={
        <Button
          color="inherit"
          size="small"
          onClick={() => setExpanded(prev => !prev)}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          {t('categories.all')}
        </Button>
      }
    >
      <Stack spacing={1}>
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          {t('unavailable', { count: missing.length })}
        </Typography>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ pt: 1 }}>
            <List dense disablePadding>
              {missing.map(item => (
                <ListItem
                  key={`${item.category}:${item.selectionId}`}
                  disableGutters
                  secondaryAction={
                    !shared && (
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon fontSize="small" />}
                        onClick={() => toggleSelection({ category: item.category, id: item.selectionId })}
                      >
                        {t('remove', { title: item.selectionId })}
                      </Button>
                    )
                  }
                >
                  <ListItemText
                    primary={item.selectionId}
                    secondary={t(`categories.${item.category}`)}
                    sx={{
                      fontFamily: 'monospace'
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Collapse>
      </Stack>
    </Alert>
  );
}