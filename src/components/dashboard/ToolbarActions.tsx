'use client';

// Hooks
import { useColorScheme } from '@mui/material/styles';

// Components
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// Icons
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';

// Local components
import LanguageToggle from './LanguageToggle';

// Types
import type { MouseEvent } from 'react';
import type { Props as CommonProps } from './types';

type Props = CommonProps;
type ColorSchemeMode =
  Parameters<ReturnType<typeof useColorScheme>['setMode']>[0];

export default function ToolbarActions(props: Props) {
  const { mode, setMode } = useColorScheme();

  const handleChangeThemeMode = (
    _event: MouseEvent<HTMLElement>,
    paletteMode: ColorSchemeMode | null
  ) => {
    if (paletteMode !== null) {
      setMode(paletteMode);
    }
  };

  return (
    <Stack
      direction="row"
      spacing={{ xs: 0.25, sm: 0.75 }}
      sx={{ alignItems: 'center', minWidth: 0 }}
    >
      <LanguageToggle
        englishLabel={props.englishLabel}
        frenchLabel={props.frenchLabel}
        languageTitle={props.languageTitle}
      />

      <ToggleButtonGroup
        aria-label={props.modeTitle}
        color="primary"
        exclusive
        onChange={handleChangeThemeMode}
        size="small"
        value={mode}
      >
        <Tooltip title={props.lightLabel}>
          <ToggleButton aria-label={props.lightLabel} value="light">
            <LightModeIcon fontSize="small" />
            <Typography
              component="span"
              sx={{ display: { xs: 'none', md: 'inline' }, ml: 0.5 }}
            >
              {props.lightLabel}
            </Typography>
          </ToggleButton>
        </Tooltip>

        <Tooltip title={props.systemLabel}>
          <ToggleButton aria-label={props.systemLabel} value="system">
            <SettingsBrightnessIcon fontSize="small" />
            <Typography
              component="span"
              sx={{ display: { xs: 'none', md: 'inline' }, ml: 0.5 }}
            >
              {props.systemLabel}
            </Typography>
          </ToggleButton>
        </Tooltip>

        <Tooltip title={props.darkLabel}>
          <ToggleButton aria-label={props.darkLabel} value="dark">
            <DarkModeOutlinedIcon fontSize="small" />
            <Typography
              component="span"
              sx={{ display: { xs: 'none', md: 'inline' }, ml: 0.5 }}
            >
              {props.darkLabel}
            </Typography>
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Stack>
  );
}