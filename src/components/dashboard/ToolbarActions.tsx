'use client';

// Hooks
import dynamic from 'next/dynamic'
import { useState, useCallback, Suspense } from "react";
import { useColorScheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
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

export default function ToolbarActions(){

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { mode, setMode } = useColorScheme();
    const pathname = usePathname();
    const t = useTranslations("toolbar");

    const toggleMenu = useCallback(
        () => {
            setIsMenuOpen((previousIsMenuOpen) => !previousIsMenuOpen);
        },
        [isMenuOpen]
    );

    const handleChangeThemeMode = (event : any, paletteMode : any) => {
        if (paletteMode === null) {
          return;
        }
        setMode(paletteMode);
    };

    return (
        <>
            <IconButton aria-label={t("settings")} onClick={toggleMenu}>
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
                            {t("modes.title")}
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
                                aria-label={t('modes.light')}
                            >
                                <LightModeIcon fontSize="small" />
                                {t('modes.light')}
                            </ToggleButton>

                            <ToggleButton
                                value="system"
                                aria-label={t('modes.system')}
                            >
                                <SettingsBrightnessIcon fontSize="small" />
                                {t('modes.system')}
                            </ToggleButton>

                            <ToggleButton
                                value="dark"
                                aria-label={t('modes.dark')}
                            >
                                <DarkModeOutlinedIcon fontSize="small" />
                                {t('modes.dark')}
                            </ToggleButton>

                        </ToggleButtonGroup>

                        <Typography variant="body1" gutterBottom id="settings-language">
                            {t("languages.title")}
                        </Typography>
                        <ButtonGroup variant="outlined" aria-label={t("languages.title")}>
                            <Link href={pathname} locale={"fr"}>
                                <Button>{t("languages.fr")}</Button>
                            </Link>
                            <Link href={pathname} locale={"en"}>
                                <Button>{t("languages.en")}</Button>
                            </Link>
                        </ButtonGroup>
                    </Box>
                </Drawer>
            </Suspense>
        </>
    )

}