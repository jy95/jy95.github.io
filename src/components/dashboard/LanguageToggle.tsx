'use client';

import { Suspense, useState } from 'react';
import type { MouseEvent } from 'react';

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
type RouteParams = Record<string, string | string[]>;
type Props = Pick<CommonProps, 'englishLabel' | 'frenchLabel' | 'languageTitle'>;

const LOCALES: readonly Locale[] = ['fr', 'en'];

/** Groups repeated keys, e.g. `?genres=1&genres=2` becomes `{ genres: ['1', '2'] }`. */
const toQuery = (search: URLSearchParams) =>
  Object.fromEntries([...new Set(search.keys())].map(key => [key, search.getAll(key)]));

/**
 * `usePathname()` returns the route *template* ("/video/[id]"), so dynamic
 * segments must be forwarded as `params`; query parameters (shared selections,
 * catalogue filters) are preserved too. A plain string is used when there is
 * nothing to forward.
 */
function buildHref(pathname: string, params: RouteParams, search: URLSearchParams): Href {
  const hasParams = Object.keys(params).length > 0;
  if (!hasParams && search.size === 0) return pathname as Href;

  const href: Record<string, unknown> = { pathname };
  if (hasParams) href.params = params;
  if (search.size > 0) href.query = toQuery(search);
  return href as Href;
}

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
  const { locale: _localeParam, ...routeParams } = useParams<RouteParams>() ?? {};

  const labels: Record<Locale, string> = { fr: props.frenchLabel, en: props.englishLabel };

  const handleClose = () => setAnchorEl(null);

  const changeLanguage = (nextLocale: Locale) => {
    if (nextLocale !== locale) {
      const search = new URLSearchParams(window.location.search);
      router.replace(buildHref(pathname, routeParams, search), { locale: nextLocale });
    }
    handleClose();
  };

  return (
    <>
      <Tooltip title={props.languageTitle} disableTouchListener>
        <Button
          onClick={(event: MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget)}
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
        {LOCALES.map((option) => (
          <MenuItem key={option} selected={locale === option} onClick={() => changeLanguage(option)}>
            <ListItemIcon>
              <CheckIcon
                fontSize="small"
                color="primary"
                sx={{ visibility: locale === option ? 'visible' : 'hidden' }}
              />
            </ListItemIcon>
            <ListItemText>{labels[option]}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
