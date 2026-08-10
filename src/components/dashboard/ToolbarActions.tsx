'use client';

import { useState } from 'react';
import type { MouseEvent } from 'react';

// Hooks & MUI
import { useColorScheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';

// Icons
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import CheckIcon from '@mui/icons-material/Check';

// Local components & Types
import LanguageToggle from './LanguageToggle';
import type { Props as CommonProps } from './types';

type Props = CommonProps;
type ColorSchemeMode = Parameters<ReturnType<typeof useColorScheme>['setMode']>[0];

export default function ToolbarActions(props: Props) {
  const { mode, setMode } = useColorScheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectMode = (newMode: ColorSchemeMode) => {
    setMode(newMode);
    handleClose();
  };

  // Icône représentant le mode actif
  const getCurrentIcon = () => {
    switch (mode) {
      case 'light':
        return <LightModeIcon fontSize="small" />;
      case 'dark':
        return <DarkModeOutlinedIcon fontSize="small" />;
      default:
        return <SettingsBrightnessIcon fontSize="small" />;
    }
  };

  return (
    <Stack
      direction="row"
      spacing={{ xs: 0.5, sm: 1 }}
      sx={{ alignItems: 'center', minWidth: 0 }}
    >
      <LanguageToggle
        englishLabel={props.englishLabel}
        frenchLabel={props.frenchLabel}
        languageTitle={props.languageTitle}
      />

      {/* Bouton unique pour le thème */}
      <Tooltip title={props.modeTitle} disableTouchListener>
        <IconButton
          onClick={handleClick}
          size="small"
          aria-label={props.modeTitle}
          aria-controls={open ? 'theme-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'text.primary' },
          }}
        >
          {getCurrentIcon()}
        </IconButton>
      </Tooltip>

      {/* Menu de sélection */}
      <Menu
        id="theme-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            elevation: 3,
            sx: { minWidth: 160, mt: 1 },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          selected={mode === 'light'}
          onClick={() => handleSelectMode('light')}
        >
          <ListItemIcon>
            <LightModeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{props.lightLabel}</ListItemText>
          {mode === 'light' && <CheckIcon fontSize="small" color="primary" />}
        </MenuItem>

        <MenuItem
          selected={mode === 'dark'}
          onClick={() => handleSelectMode('dark')}
        >
          <ListItemIcon>
            <DarkModeOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{props.darkLabel}</ListItemText>
          {mode === 'dark' && <CheckIcon fontSize="small" color="primary" />}
        </MenuItem>

        <MenuItem
          selected={mode === 'system'}
          onClick={() => handleSelectMode('system')}
        >
          <ListItemIcon>
            <SettingsBrightnessIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{props.systemLabel}</ListItemText>
          {mode === 'system' && <CheckIcon fontSize="small" color="primary" />}
        </MenuItem>
      </Menu>
    </Stack>
  );
}