'use client';

// Hooks
import dynamic from 'next/dynamic'
import { useState, Suspense } from "react";
import { useColorScheme } from '@mui/material/styles';
import { Link, usePathname } from '@/i18n/routing';

// Components
const Drawer = dynamic(() => import('@mui/material/Drawer'));
const Box = dynamic(() => import('@mui/material/Box'));
import IconButton from '@mui/material/IconButton';
import Typography from "@mui/material/Typography";
const ToggleButtonGroup = dynamic(() => import('@mui/material/ToggleButtonGroup'));
const ToggleButton = dynamic(() => import('@mui/material/ToggleButton'));
const Button = dynamic(() => import('@mui/material/Button'));
const ButtonGroup = dynamic(() => import('@mui/material/ButtonGroup'));

// Icons
import SettingsIcon from '@mui/icons-material/Settings';
const LightModeIcon = dynamic(() => import('@mui/icons-material/LightMode'));
const DarkModeOutlinedIcon = dynamic(() => import('@mui/icons-material/DarkModeOutlined'));
const SettingsBrightnessIcon = dynamic(() => import('@mui/icons-material/SettingsBrightness'));

// https://mui.com/toolpad/core/react-dashboard-layout/#slots
// https://mui.com/material-ui/customization/css-theme-variables/configuration/#toggling-dark-mode-manually

// Labels
type Props = {
    settingsLabel: string,
    modeTitle: string,
    lightLabel: string,
    darkLabel: string,
    systemLabel: string,
    languageTitle: string,
    frenchLabel: string,
    englishLabel: string
}

export default function ToolbarActions(props: Props){

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { mode, setMode } = useColorScheme();
    const pathname = usePathname();

    const toggleMenu = () => setIsMenuOpen((previousIsMenuOpen) => !previousIsMenuOpen);

    const handleChangeThemeMode = (event : any, paletteMode : any) => {
        if (paletteMode === null) {
          return;
        }
        setMode(paletteMode);
    };

    return (
        <>
            <IconButton aria-label={props.settingsLabel} onClick={toggleMenu}>
                <SettingsIcon />
            </IconButton>
            <Suspense fallback={null}>
                <Drawer 
                    open={isMenuOpen} 
                    onClose={toggleMenu}
                    anchor="right"
                >
                    <Box sx={{ pl: 2, pr: 2, py: 10 }}>

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

                        <Typography variant="body1" gutterBottom id="settings-language">
                            {props.languageTitle}
                        </Typography>
                        <ButtonGroup variant="outlined" aria-label={props.languageTitle}>
                            <Link href={pathname} locale={"fr"}>
                                <Button>{props.frenchLabel}</Button>
                            </Link>
                            <Link href={pathname} locale={"en"}>
                                <Button>{props.englishLabel}</Button>
                            </Link>
                        </ButtonGroup>
                    </Box>
                </Drawer>
            </Suspense>
        </>
    )

}