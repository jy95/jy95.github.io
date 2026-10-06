'use client';

import { Suspense, useState } from 'react';

// Hooks
import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/routing';
import type { Href } from '@/i18n/routing';

// Components
import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';

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

  // `useParams()` also contains the `[locale]` segment itself, which must not be
  // forwarded: the locale is switched through the `locale` option instead.
  const { locale: _localeParam, ...routeParams } = useParams<Record<string, string | string[]>>() ?? {};

  const options = [
    { value: 'fr', label: props.frenchLabel },
    { value: 'en', label: props.englishLabel },
  ] as const;

  const handleClose = () => setAnchorEl(null);

  const changeLanguage = (nextLocale: Locale) => {
    handleClose();
    if (nextLocale === locale) return;

    // `usePathname()` returns the route template ("/video/[id]"), so dynamic
    // segments are forwarded as `params`. Query parameters (shared selections,
    // catalogue filters) are kept too; repeated keys are grouped into arrays.
    const search = new URLSearchParams(window.location.search);
    const query = Object.fromEntries([...new Set(search.keys())].map(key => [key, search.getAll(key)]));
    const hasParams = Object.keys(routeParams).length > 0;
    const hasQuery = search.size > 0;

    const href = hasParams || hasQuery
      ? { pathname, ...(hasParams && { params: routeParams }), ...(hasQuery && { query }) }
      : pathname;

    router.replace(href as Href, { locale: nextLocale });
  };

  return (
    <>
      <Tooltip title={props.languageTitle} disableTouchListener>
        <Button
          onClick={event => setAnchorEl(event.currentTarget)}
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
        slotProps={{ paper: { elevation: 3, sx: { minWidth: 150, mt: 1 } } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {options.map(({ value, label }) => (
          <MenuItem key={value} selected={locale === value} onClick={() => changeLanguage(value)}>
            <ListItemIcon>
              <CheckIcon
                fontSize="small"
                color="primary"
                sx={{ visibility: locale === value ? 'visible' : 'hidden' }}
              />
            </ListItemIcon>
            <ListItemText>{label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
