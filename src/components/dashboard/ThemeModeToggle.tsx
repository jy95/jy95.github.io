'use client';

// Hooks
import { useColorScheme } from '@mui/material/styles';

// Components
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Typography from "@mui/material/Typography";

// Icons
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';

// Types
import type { MouseEvent } from "react";
import type { Props as CommonProps } from './types';
type UsedProps = Pick<CommonProps, "modeTitle" | "darkLabel" | "lightLabel" | "systemLabel">
type Props = UsedProps;

export default function ThemeMode(props: Props) {

    const { mode, setMode } = useColorScheme();

    /* eslint-disable */
    const handleChangeThemeMode = (_event : MouseEvent<HTMLElement>, paletteMode : any) => {
        if (paletteMode === null) {
          return;
        }
        setMode(paletteMode);
    };
    /* eslint-enable */

    return (
        <>
            <Typography variant="body1" gutterBottom id="settings-mode">
                {props.modeTitle}
            </Typography>
            <ToggleButtonGroup
                exclusive
                value={mode}
                color="primary"
                onChange={handleChangeThemeMode}
                aria-labelledby="settings-mode"
                fullWidth
            >

                <ToggleButton
                    value="light"
                    aria-label={props.lightLabel}
                >
                    <LightModeIcon fontSize="small" />
                    {props.lightLabel}
                </ToggleButton>

                <ToggleButton
                    value="system"
                    aria-label={props.systemLabel}
                >
                    <SettingsBrightnessIcon fontSize="small" />
                    {props.systemLabel}
                </ToggleButton>

                <ToggleButton
                    value="dark"
                    aria-label={props.darkLabel}
                >
                    <DarkModeOutlinedIcon fontSize="small" />
                    {props.darkLabel}
                </ToggleButton>

            </ToggleButtonGroup>
        </>
    );

}