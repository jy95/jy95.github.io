'use client';

// Hooks
import { useState, useCallback } from "react";
import { useColorScheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';

// Components
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from "@mui/material/Typography";
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

// Icons
import SettingsIcon from '@mui/icons-material/Settings';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';

// rest
import { styled } from '@mui/material/styles';

const IconToggleButton = styled(ToggleButton)({
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    '& > *': {
      marginRight: '8px',
    },
});

// https://mui.com/toolpad/core/react-dashboard-layout/#slots
// https://mui.com/material-ui/customization/css-theme-variables/configuration/#toggling-dark-mode-manually

export default function ToolbarActions(){

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { mode, setMode } = useColorScheme();
    const pathname = usePathname();
    const t = useTranslations("toolbar");

    const toggleMenu = useCallback(
        (event: any) => {
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

                        <IconToggleButton
                            value="light"
                            aria-label={t('modes.light')}
                        >
                            <LightModeIcon fontSize="small" />
                            {t('modes.light')}
                        </IconToggleButton>

                        <IconToggleButton
                            value="system"
                            aria-label={t('modes.system')}
                        >
                            <SettingsBrightnessIcon fontSize="small" />
                            {t('modes.system')}
                        </IconToggleButton>

                        <IconToggleButton
                            value="dark"
                            aria-label={t('modes.dark')}
                        >
                            <DarkModeOutlinedIcon fontSize="small" />
                            {t('modes.dark')}
                        </IconToggleButton>

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
        </>
    )

}