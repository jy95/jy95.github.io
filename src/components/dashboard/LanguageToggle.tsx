'use client';

// Hooks
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import type { Href } from '@/i18n/routing';

// Components
import { Suspense, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';

// Icons
import CheckIcon from '@mui/icons-material/Check';
import LanguageIcon from '@mui/icons-material/Language';

// Types
import type { MouseEvent } from 'react';
import type { Props as CommonProps } from './types';

type Locale = 'fr' | 'en';
type UsedProps = Pick<
  CommonProps,
  'englishLabel' | 'frenchLabel' | 'languageTitle'
>;
type Props = UsedProps;

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
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);

  const changeLanguage = (nextLocale: Locale) => {
    if (nextLocale === locale) {
      setAnchorElement(null);
      return;
    }

    router.replace(pathname as Href, { locale: nextLocale });
    setAnchorElement(null);
  };

  const handleDesktopLanguageChange = (
    _event: MouseEvent<HTMLElement>,
    nextLocale: Locale | null
  ) => {
    if (nextLocale !== null) {
      changeLanguage(nextLocale);
    }
  };

  const isMenuOpen = Boolean(anchorElement);

  return (
    <>
      <ToggleButtonGroup
        aria-label={props.languageTitle}
        color="primary"
        exclusive
        onChange={handleDesktopLanguageChange}
        size="small"
        sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
        value={locale}
      >
        <ToggleButton aria-label={props.frenchLabel} value="fr">
          FR
        </ToggleButton>
        <ToggleButton aria-label={props.englishLabel} value="en">
          EN
        </ToggleButton>
      </ToggleButtonGroup>

      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <Tooltip title={props.languageTitle}>
          <IconButton
            aria-controls={isMenuOpen ? 'language-menu' : undefined}
            aria-expanded={isMenuOpen ? 'true' : undefined}
            aria-haspopup="menu"
            aria-label={props.languageTitle}
            color="inherit"
            onClick={(event) => setAnchorElement(event.currentTarget)}
          >
            <LanguageIcon />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorElement}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          id="language-menu"
          onClose={() => setAnchorElement(null)}
          open={isMenuOpen}
          slotProps={{
            list: { 'aria-label': props.languageTitle }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        >
          <MenuItem
            onClick={() => changeLanguage('fr')}
            selected={locale === 'fr'}
          >
            <ListItemIcon>
              {locale === 'fr' ? <CheckIcon fontSize="small" /> : null}
            </ListItemIcon>
            <ListItemText>{props.frenchLabel}</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => changeLanguage('en')}
            selected={locale === 'en'}
          >
            <ListItemIcon>
              {locale === 'en' ? <CheckIcon fontSize="small" /> : null}
            </ListItemIcon>
            <ListItemText>{props.englishLabel}</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </>
  );
}