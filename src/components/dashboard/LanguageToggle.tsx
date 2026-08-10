'use client';

import { Suspense, useState } from 'react';
import type { MouseEvent } from 'react';

// Hooks
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import type { Href } from '@/i18n/routing';

// Components
import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';

// Icons
import CheckIcon from '@mui/icons-material/Check';
import LanguageIcon from '@mui/icons-material/Language';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// Types
import type { Props as CommonProps } from './types';

type Locale = 'fr' | 'en';
type Props = Pick<CommonProps, 'englishLabel' | 'frenchLabel' | 'languageTitle'>;

export default function LanguageToggle(props: Props) {
  return (
    <Suspense fallback={null}>
      <LanguageToggleInner {...props} />
    </Suspense>
  );
}

function LanguageToggleInner(props: Props) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (nextLocale: Locale) => {
    if (nextLocale !== locale) {
      router.replace(pathname as Href, { locale: nextLocale });
    }
    handleClose();
  };

  return (
    <>
      <Tooltip title={props.languageTitle} disableTouchListener>
        <Button
          onClick={handleClick}
          size="small"
          aria-label={props.languageTitle}
          aria-controls={open ? 'language-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          startIcon={<LanguageIcon fontSize="small" />}
          endIcon={<KeyboardArrowDownIcon fontSize="small" />}
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            textTransform: 'uppercase',
            minWidth: 'auto',
            px: 1,
            '&:hover': { color: 'text.primary' },
          }}
        >
          {locale}
        </Button>
      </Tooltip>

      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            elevation: 3,
            sx: { minWidth: 150, mt: 1 },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          selected={locale === 'fr'}
          onClick={() => changeLanguage('fr')}
        >
          <ListItemIcon>
            <CheckIcon
              fontSize="small"
              color="primary"
              sx={{ visibility: locale === 'fr' ? 'visible' : 'hidden' }}
            />
          </ListItemIcon>
          <ListItemText>{props.frenchLabel}</ListItemText>
        </MenuItem>

        <MenuItem
          selected={locale === 'en'}
          onClick={() => changeLanguage('en')}
        >
          <ListItemIcon>
            <CheckIcon
              fontSize="small"
              color="primary"
              sx={{ visibility: locale === 'en' ? 'visible' : 'hidden' }}
            />
          </ListItemIcon>
          <ListItemText>{props.englishLabel}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}