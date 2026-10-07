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
const MODE_OPTIONS = [
  { value: 'light', label: 'lightLabel', Icon: LightModeIcon },
  { value: 'dark', label: 'darkLabel', Icon: DarkModeOutlinedIcon },
  { value: 'system', label: 'systemLabel', Icon: SettingsBrightnessIcon },
] as const;

type ColorSchemeMode = typeof MODE_OPTIONS[number]['value'];

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

  const CurrentIcon = MODE_OPTIONS.find(option => option.value === mode)?.Icon ?? SettingsBrightnessIcon;

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
          <CurrentIcon fontSize="small" />
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
        {MODE_OPTIONS.map(({ value, label, Icon }) => (
          <MenuItem
            key={value}
            selected={mode === value}
            onClick={() => handleSelectMode(value)}
          >
            <ListItemIcon>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{props[label]}</ListItemText>
            {mode === value && <CheckIcon fontSize="small" color="primary" />}
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  );
}